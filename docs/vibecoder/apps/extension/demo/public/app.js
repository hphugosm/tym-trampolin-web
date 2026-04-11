const promptInput = document.getElementById("promptInput");
const modeSelect = document.getElementById("modeSelect");
const runButton = document.getElementById("runButton");
const rerunButton = document.getElementById("rerunButton");
const board = document.getElementById("board");
const statusLine = document.getElementById("statusLine");
const winnerPanel = document.getElementById("winnerPanel");
const winnerMeta = document.getElementById("winnerMeta");
const winnerOutput = document.getElementById("winnerOutput");
const taskTypeBadge = document.getElementById("taskTypeBadge");
const runModeBadge = document.getElementById("runModeBadge");
const decisionLine = document.getElementById("decisionLine");
const agentList = document.getElementById("agentList");

const state = {
  lastPrompt: "",
  mode: "test",
  branches: [],
  winner: null,
  taskType: "",
  agentPlan: []
};

runButton.addEventListener("click", runBranches);
rerunButton.addEventListener("click", rerunWinner);

async function runBranches() {
  const prompt = promptInput.value.trim();
  const mode = modeSelect.value;

  if (!prompt) {
    statusLine.textContent = "First add a prompt. Think of it like giving the team a mission.";
    return;
  }

  setLoading(true, "Running 3 lanes in parallel...");
  state.mode = mode;
  state.lastPrompt = prompt;
  state.winner = null;
  winnerPanel.hidden = true;

  try {
    const response = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, mode })
    });

    if (!response.ok) {
      throw new Error(`Run failed (${response.status})`);
    }

    const data = await response.json();
    state.branches = data.branches;
    state.taskType = data.taskType;
    state.agentPlan = data.agentPlan;
    renderAutopilot(data);
    renderBoard();
    statusLine.textContent = `Run complete in ${data.totalLatencyMs} ms. Pick your winner.`;
  } catch (error) {
    statusLine.textContent = error instanceof Error ? error.message : "Unexpected run error";
  } finally {
    setLoading(false);
  }
}

async function rerunWinner() {
  if (!state.winner) {
    return;
  }

  setLoading(true, "Rerunning winner with the selected mode...");

  try {
    const response = await fetch("/api/rerun-winner", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: state.lastPrompt,
        winnerBranch: state.winner.branch,
        winnerOutput: state.winner.output,
        mode: state.mode
      })
    });

    if (!response.ok) {
      throw new Error(`Rerun failed (${response.status})`);
    }

    const data = await response.json();
    winnerMeta.textContent = `Branch ${data.winnerBranch} rerun via ${data.result.providerUsed} in ${data.result.latencyMs} ms`;
    winnerOutput.textContent = data.result.output;
    decisionLine.textContent = `Winner branch ${data.winnerBranch} was polished in '${state.mode}' mode.`;
    winnerPanel.hidden = false;
    statusLine.textContent = "Winner rerun complete.";
  } catch (error) {
    statusLine.textContent = error instanceof Error ? error.message : "Unexpected rerun error";
  } finally {
    setLoading(false);
  }
}

function renderBoard() {
  board.innerHTML = "";

  for (const branch of state.branches) {
    const card = document.createElement("article");
    card.className = `card${state.winner?.branch === branch.branch ? " active" : ""}`;

    const heading = document.createElement("h2");
    heading.textContent = `Branch ${branch.branch}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = [
      `<span class="badge">Agent: ${escapeHtml(branch.agentName || "Specialist")}</span>`,
      `<span class="badge">Task: ${escapeHtml(branch.taskType || state.taskType || "generic")}</span>`,
      `<span class="badge">Style: ${escapeHtml(branch.strategy || "variant")}</span>`,
      `<span class="badge">Model: ${escapeHtml(branch.providerUsed)}</span>`,
      `<span class="badge">Latency: ${branch.latencyMs} ms</span>`,
      branch.fallbackUsed ? '<span class="badge">Fallback used</span>' : ""
    ].join("");

    const output = document.createElement("pre");
    output.textContent = branch.output;

    const chooseButton = document.createElement("button");
    chooseButton.textContent = "Promote winner";
    chooseButton.addEventListener("click", () => {
      state.winner = branch;
      rerunButton.disabled = false;
      statusLine.textContent = `Branch ${branch.branch} promoted. You can rerun now.`;
      renderBoard();
    });

    card.append(heading, meta, output, chooseButton);
    board.append(card);
  }
}

function renderAutopilot(data) {
  taskTypeBadge.textContent = `Task type: ${formatTaskType(data.taskType)}`;
  runModeBadge.textContent = `Mode: ${data.mode}`;
  decisionLine.textContent = data.orchestratorDecision;
  agentList.innerHTML = "";

  for (const [index, agent] of (data.agentPlan || []).entries()) {
    const item = document.createElement("span");
    item.className = "agentPill";
    item.textContent = `${String.fromCharCode(65 + index)}: ${agent}`;
    agentList.append(item);
  }
}

function setLoading(isLoading, message) {
  runButton.disabled = isLoading;
  rerunButton.disabled = isLoading || !state.winner;
  if (message) {
    statusLine.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTaskType(value) {
  return String(value || "generic_build")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
