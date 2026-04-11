import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { randomUUID } from "node:crypto";

const HOST = "127.0.0.1";
const PORT = Number(process.env.VIBECODER_DEMO_PORT || 8787);
const PUBLIC_DIR = join(process.cwd(), "demo", "public");

const MODEL_BY_MODE = {
  test: { primary: "zen-free", backup: "zen-lite" },
  generalka: { primary: "opencode-pro", backup: "zen-plus" }
};

const BRANCH_PROFILES = {
  A: "bold visual direction",
  B: "safe product direction",
  C: "conversion-focused direction"
};

const AGENT_PLAN_BY_TASK = {
  ui_design: ["UX Scout", "Visual Crafter", "Conversion Coach"],
  frontend_code: ["Code Architect", "Component Builder", "Refactor Reviewer"],
  growth_copy: ["Story Strategist", "CTA Writer", "Audience Reviewer"],
  bugfix_debug: ["Bug Hunter", "Fix Maker", "Regression Guard"],
  product_idea: ["Concept Mapper", "Feature Prioritizer", "Pitch Editor"],
  generic_build: ["Task Planner", "Execution Agent", "Quality Reviewer"]
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      sendJson(res, 400, { error: "Invalid request" });
      return;
    }

    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (req.method === "POST" && url.pathname === "/api/run") {
      const body = await readJson(req);
      const prompt = String(body.prompt || "").trim();
      const mode = normalizeMode(body.mode);
      const taskType = detectTaskType(prompt);
      const agentPlan = AGENT_PLAN_BY_TASK[taskType];

      if (!prompt) {
        sendJson(res, 400, { error: "Prompt is required" });
        return;
      }

      const runId = randomUUID();
      const startedAt = Date.now();

      const branches = await Promise.all(
        ["A", "B", "C"].map((branch, index) =>
          runBranch({
            prompt,
            mode,
            branch,
            rerun: false,
            taskType,
            agentName: agentPlan[index]
          })
        )
      );

      sendJson(res, 200, {
        runId,
        mode,
        prompt,
        taskType,
        agentPlan,
        orchestratorDecision: `Detected task type '${taskType}' and launched 3 specialist agents in parallel.`,
        totalLatencyMs: Date.now() - startedAt,
        branches,
        createdAt: new Date().toISOString()
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/rerun-winner") {
      const body = await readJson(req);
      const prompt = String(body.prompt || "").trim();
      const winnerBranch = String(body.winnerBranch || "").toUpperCase();
      const winnerOutput = String(body.winnerOutput || "").trim();
      const mode = normalizeMode(body.mode);
      const taskType = detectTaskType(prompt);
      const agentPlan = AGENT_PLAN_BY_TASK[taskType];

      if (!prompt || !winnerOutput || !["A", "B", "C"].includes(winnerBranch)) {
        sendJson(res, 400, { error: "Invalid rerun payload" });
        return;
      }

      const runId = randomUUID();
      const improvedPrompt = `${prompt}\n\nImprove this chosen direction:\n${winnerOutput}`;
      const winnerResult = await runBranch({
        prompt: improvedPrompt,
        mode,
        branch: winnerBranch,
        rerun: true,
        taskType,
        agentName: agentPlan[["A", "B", "C"].indexOf(winnerBranch)]
      });

      sendJson(res, 200, {
        runId,
        mode,
        originalPrompt: prompt,
        improvedPrompt,
        winnerBranch,
        taskType,
        result: winnerResult,
        createdAt: new Date().toISOString()
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, service: "vibecoder-demo" });
      return;
    }

    if (req.method === "GET") {
      await serveStatic(url.pathname, res);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    sendJson(res, 500, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[vibecoder demo] running at http://${HOST}:${PORT}`);
});

function normalizeMode(mode) {
  return mode === "generalka" ? "generalka" : "test";
}

async function runBranch({ prompt, mode, branch, rerun, taskType, agentName }) {
  const branchPrompt = `${prompt}\n\nDirection ${branch}: ${BRANCH_PROFILES[branch]}`;
  const modelPolicy = MODEL_BY_MODE[mode];
  const start = Date.now();

  try {
    const output = await generateWithModel({
      model: modelPolicy.primary,
      prompt: branchPrompt,
      mode,
      branch,
      rerun
    });

    return {
      branch,
      strategy: BRANCH_PROFILES[branch],
      agentName,
      taskType,
      mode,
      providerUsed: modelPolicy.primary,
      fallbackUsed: false,
      latencyMs: Date.now() - start,
      output
    };
  } catch {
    const output = await generateWithModel({
      model: modelPolicy.backup,
      prompt: branchPrompt,
      mode,
      branch,
      rerun
    });

    return {
      branch,
      strategy: BRANCH_PROFILES[branch],
      agentName,
      taskType,
      mode,
      providerUsed: modelPolicy.backup,
      fallbackUsed: true,
      latencyMs: Date.now() - start,
      output
    };
  }
}

async function generateWithModel({ model, prompt, mode, branch, rerun }) {
  const forceFail = prompt.toLowerCase().includes("#fail-primary") && model.includes("free");

  if (forceFail) {
    throw new Error("Primary model failure simulated");
  }

  const latency = mode === "generalka" ? 1200 : 700;
  await wait(latency + Math.floor(Math.random() * 350));

  const qualityNote =
    mode === "generalka"
      ? "Higher polish: tighter structure, clearer hierarchy, sharper CTA."
      : "Fast draft: practical shape, minimal polish, quick iteration.";

  const rerunNote = rerun ? "Rerun winner mode: refine selected direction." : "Initial branch generation.";

  return [
    `Branch ${branch} (${model})`,
    "",
    qualityNote,
    rerunNote,
    "",
    "This draft is generated by an auto-assigned specialist agent.",
    "",
    "Prompt summary:",
    prompt.slice(0, 240)
  ].join("\n");
}

function detectTaskType(prompt) {
  const text = prompt.toLowerCase();

  if (containsAny(text, ["landing", "ui", "design", "dashboard", "hero", "layout"])) {
    return "ui_design";
  }

  if (containsAny(text, ["react", "component", "typescript", "api", "frontend", "code"])) {
    return "frontend_code";
  }

  if (containsAny(text, ["copy", "campaign", "growth", "cta", "marketing", "brand"])) {
    return "growth_copy";
  }

  if (containsAny(text, ["bug", "fix", "error", "debug", "crash", "issue"])) {
    return "bugfix_debug";
  }

  if (containsAny(text, ["idea", "concept", "feature", "product", "startup"])) {
    return "product_idea";
  }

  return "generic_build";
}

function containsAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function serveStatic(pathname, res) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^\.\.(\/|\\|$)+/, "");
  const filePath = join(PUBLIC_DIR, safePath);
  const extension = extname(filePath);

  try {
    const content = await readFile(filePath);
    const mimeType = MIME_TYPES[extension] || "application/octet-stream";
    res.writeHead(200, { "content-type": mimeType });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: "File not found" });
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}
