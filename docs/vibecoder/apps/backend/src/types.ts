export type JobStatus = "queued" | "running" | "completed" | "failed";

export type JobStage = "planner" | "coder" | "reviewer" | "done";

export interface JobStageTrace {
  stage: Exclude<JobStage, "done">;
  provider: "openai" | "gemini" | "opencodezen";
  startedAt: string;
  finishedAt: string;
  summary: string;
}

export interface GitFlowMetadata {
  branchName: string;
  commitMessage: string;
  authorName: string;
  authorEmail: string;
}

export interface JobRecord {
  id: string;
  task: string;
  status: JobStatus;
  stage: JobStage;
  createdAt: string;
  updatedAt: string;
  result?: string;
  error?: string;
  trace: JobStageTrace[];
  git?: GitFlowMetadata;
}

export interface CreateJobRequest {
  task: string;
}
