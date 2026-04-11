import { getJob, upsertJob } from "./store.js";
import { JobStage, JobStageTrace } from "./types.js";
import { AIProvider } from "./ai.js";
import { generateGitFlow } from "./git.js";

// Všechny fáze přes OpenCode Zen
const STAGE_PROVIDER: Record<Exclude<JobStage, "done">, "opencodezen"> = {
  planner: "opencodezen",
  coder: "opencodezen",
  reviewer: "opencodezen"
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runStage(
  stage: Exclude<JobStage, "done">,
  task: string,
  aiProvider: AIProvider,
  priorOutputs: Record<string, string>
): Promise<{ trace: JobStageTrace; output: string }> {
  const startedAt = new Date().toISOString();

  const prompts = {
    planner: `You are an expert planning assistant. Break down this task into a detailed implementation plan with clear steps:\n\nTask: ${task}`,
    coder: `You are an expert code generation assistant. Based on this plan, generate clean, well-structured code:\n\nOriginal Task: ${task}\n\nPrevious Plan:\n${priorOutputs.planner || ""}`,
    reviewer: `You are an expert code reviewer. Review this code for quality, maintainability, and best practices. Provide constructive feedback:\n\nOriginal Task: ${task}\n\nCode:\n${priorOutputs.coder || ""}`
  };

  const provider = STAGE_PROVIDER[stage];
  let output: string;

  try {
    if (provider === "opencodezen") {
      output = await aiProvider.callOpenCodeZen(prompts[stage]);
    } else {
      output = `Error: Unknown provider ${provider}`;
    }
  } catch (error) {
    output = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }

  const finishedAt = new Date().toISOString();
  const summary = output.slice(0, 120).replace(/\n/g, " ") + "...";

  return {
    trace: {
      stage,
      provider,
      startedAt,
      finishedAt,
      summary
    },
    output
  };
}

export async function runSequentialPipeline(
  jobId: string,
  aiProvider: AIProvider,
  authorName: string,
  authorEmail: string
): Promise<void> {
  const job = getJob(jobId);
  if (!job) {
    return;
  }

  job.status = "running";
  job.stage = "planner";
  upsertJob(job);

  const outputs: Record<string, string> = {};

  try {
    // Planner stage
    const plannerResult = await runStage("planner", job.task, aiProvider, {});
    job.trace.push(plannerResult.trace);
    outputs.planner = plannerResult.output;
    job.stage = "coder";
    upsertJob(job);

    // Coder stage
    const coderResult = await runStage("coder", job.task, aiProvider, outputs);
    job.trace.push(coderResult.trace);
    outputs.coder = coderResult.output;
    job.stage = "reviewer";
    upsertJob(job);

    // Reviewer stage
    const reviewerResult = await runStage("reviewer", job.task, aiProvider, outputs);
    job.trace.push(reviewerResult.trace);
    outputs.reviewer = reviewerResult.output;

    job.stage = "done";
    job.status = "completed";
    job.result = [outputs.planner, "---\n\n", outputs.coder, "\n---\n\n", outputs.reviewer].join("\n");
    
    // Add git flow metadata
    job.git = generateGitFlow(job.task, authorName, authorEmail);

    upsertJob(job);
  } catch (error) {
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Unknown orchestration error";
    upsertJob(job);
  }
}
