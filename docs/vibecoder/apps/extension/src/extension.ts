import * as vscode from "vscode";

type JobStatus = "queued" | "running" | "completed" | "failed";
type JobStage = "planner" | "coder" | "reviewer" | "done";

interface JobStageTrace {
  stage: Exclude<JobStage, "done">;
  provider: "openai" | "gemini";
  startedAt: string;
  finishedAt: string;
  summary: string;
}

interface GitFlowMetadata {
  branchName: string;
  commitMessage: string;
  authorName: string;
  authorEmail: string;
}

interface JobRecord {
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

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.name = "VibeCoder Status";
  statusBar.text = "VibeCoder: idle";
  statusBar.show();
  context.subscriptions.push(statusBar);

  const disposable = vscode.commands.registerCommand("vibecoder.runTask", async () => {
    const task = await vscode.window.showInputBox({
      placeHolder: "Describe what you want to build",
      prompt: "Run planner -> coder -> reviewer pipeline"
    });

    if (!task) {
      return;
    }

    const config = vscode.workspace.getConfiguration();
    const backendUrl = String(config.get("vibecoder.backendUrl", "http://127.0.0.1:8787")).replace(/\/$/, "");

    const panel = vscode.window.createWebviewPanel(
      "vibecoderStatus",
      "VibeCoder Job Status",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    panel.webview.html = renderHtml({
      task,
      status: "queued",
      stage: "planner",
      trace: [],
      updatedAt: new Date().toISOString()
    });

    statusBar.text = "VibeCoder: creating job";

    try {
      const createResponse = await fetch(`${backendUrl}/api/jobs`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ task })
      });

      if (!createResponse.ok) {
        throw new Error(`Backend returned ${createResponse.status}`);
      }

      const payload = (await createResponse.json()) as { jobId: string };
      startPolling(panel, statusBar, backendUrl, payload.jobId, task, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      statusBar.text = "VibeCoder: backend error";
      panel.webview.html = renderHtml({
        task,
        status: "failed",
        stage: "done",
        trace: [],
        updatedAt: new Date().toISOString(),
        error: message
      });
      void vscode.window.showErrorMessage(`VibeCoder failed to create job: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function startPolling(
  panel: vscode.WebviewPanel,
  statusBar: vscode.StatusBarItem,
  backendUrl: string,
  jobId: string,
  task: string,
  context: vscode.ExtensionContext
): void {
  const timer = setInterval(async () => {
    if (!panel.visible) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error(`Polling failed with status ${response.status}`);
      }

      const job = (await response.json()) as JobRecord;
      statusBar.text = `VibeCoder: ${job.status} (${job.stage})`;
      panel.webview.html = renderHtml(job);

      if (job.status === "completed" || job.status === "failed") {
        clearInterval(timer);
      }
    } catch (error) {
      clearInterval(timer);
      const message = error instanceof Error ? error.message : "Unknown polling error";
      statusBar.text = "VibeCoder: poll error";
      panel.webview.html = renderHtml({
        id: jobId,
        task,
        status: "failed",
        stage: "done",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trace: [],
        error: message
      });
      void vscode.window.showErrorMessage(`VibeCoder polling failed: ${message}`);
    }
  }, 1200);

  panel.onDidDispose(() => clearInterval(timer));
  context.subscriptions.push({ dispose: () => clearInterval(timer) });
}

function renderHtml(job: Partial<JobRecord> & { task: string; status: JobStatus; stage: JobStage; trace: JobStageTrace[]; updatedAt: string }): string {
  const traces = job.trace
    .map(
      (item) =>
        `<li><strong>${item.stage}</strong> via ${item.provider}<br/><small>${item.summary}</small></li>`
    )
    .join("\n");

  const resultBlock = job.result
    ? `<section><h2>Result</h2><pre id="result">${escapeHtml(job.result)}</pre><button onclick="copyToClipboard('result')">Copy to Clipboard</button></section>`
    : "";

  const errorBlock = job.error
    ? `<section><h2>Error</h2><pre>${escapeHtml(job.error)}</pre></section>`
    : "";

  const gitBlock = job.git && job.status === "completed"
    ? `<section><h2>Git Setup</h2>
        <dl>
          <dt>Branch:</dt>
          <dd><code id="branchName">${escapeHtml(job.git.branchName)}</code></dd>
          <button onclick="copyToClipboard('branchName')">Copy Branch Name</button>
          <dt style="margin-top: 16px;">Author:</dt>
          <dd>${escapeHtml(job.git.authorName)} &lt;${escapeHtml(job.git.authorEmail)}&gt;</dd>
          <dt>Commit Message:</dt>
          <dd><pre id="commitMsg">${escapeHtml(job.git.commitMessage)}</pre></dd>
          <button onclick="copyToClipboard('commitMsg')">Copy Commit Message</button>
        </dl>
        <p><em>Use 'git checkout -b &lt;branch&gt;' to create the branch, then commit your changes.</em></p>
      </section>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        font-family: ui-sans-serif, system-ui, sans-serif;
        margin: 16px;
      }
      h1, h2 {
        margin-bottom: 8px;
      }
      .meta {
        opacity: 0.8;
        margin-bottom: 10px;
      }
      pre {
        white-space: pre-wrap;
        border: 1px solid color-mix(in oklab, canvasText 30%, transparent);
        border-radius: 8px;
        padding: 12px;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin-bottom: 8px;
      }
      dl {
        margin: 0;
      }
      dt {
        font-weight: 600;
        margin-top: 8px;
      }
      dd {
        margin-left: 16px;
        margin-bottom: 4px;
      }
      button {
        background-color: color-mix(in oklab, canvasText 15%, transparent);
        border: 1px solid color-mix(in oklab, canvasText 30%, transparent);
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 8px;
      }
      button:hover {
        background-color: color-mix(in oklab, canvasText 25%, transparent);
      }
    </style>
    <script>
      function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        const text = element.textContent || element.innerText;
        navigator.clipboard.writeText(text).then(() => {
          alert('Copied to clipboard!');
        }).catch(() => {
          alert('Failed to copy');
        });
      }
    </script>
  </head>
  <body>
    <h1>VibeCoder Job</h1>
    <div class="meta">Status: <strong>${job.status}</strong> | Stage: <strong>${job.stage}</strong></div>
    <div class="meta">Last update: ${new Date(job.updatedAt).toLocaleTimeString()}</div>
    <section>
      <h2>Task</h2>
      <pre>${escapeHtml(job.task)}</pre>
    </section>
    <section>
      <h2>Trace</h2>
      <ul>${traces || "<li>Waiting for first stage...</li>"}</ul>
    </section>
    ${resultBlock}
    ${gitBlock}
    ${errorBlock}
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function deactivate(): void {
  // no-op
}
