import { useState } from 'react'
import { defaultBrief, quickChecks } from '../data/examples'
import { getWorkerCommand, workflowOrder, workflowSteps } from '../lib/workflow'
import WorkflowStepCard from '../components/WorkflowStepCard'

function HomePage() {
  const [brief, setBrief] = useState(defaultBrief)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const workerCommand = getWorkerCommand(brief)

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(workerCommand)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }

    window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)
  }

  return (
    <main className="page-shell">
      <section className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">Local vibecoder worker</p>
          <h1>vibecoder-v2</h1>
          <p className="hero__lede">
            Internal workflow tool for sequencing structure, UI, research, review, and polish.
            The goal is faster demo creation, not a presentation layer for judges.
          </p>
        </div>

        <div className="hero__meta">
          <div>
            <span className="meta-label">Role order</span>
            <strong>{workflowOrder.join(' → ')}</strong>
          </div>
          <div>
            <span className="meta-label">OpenCode config</span>
            <strong>opencode.json + prompts/</strong>
          </div>
        </div>
      </section>

      <section className="panel brief-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Worker input</p>
            <h2>Brief</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => setBrief(defaultBrief)}>
            Reset example
          </button>
        </div>

        <textarea
          className="brief-input"
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          spellCheck={false}
        />

        <div className="command-row">
          <pre className="command-block">{workerCommand}</pre>
          <button className="primary-button" type="button" onClick={copyCommand}>
            {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy command'}
          </button>
        </div>

        <p className="helper-text">
          The worker script will run the five role prompts in order. If no provider env is set, it
          falls back to dry-run and prints the exact commands.
        </p>
      </section>

      <section className="workflow-grid">
        {workflowSteps.map((step, index) => (
          <WorkflowStepCard key={step.role} step={step} index={index} />
        ))}
      </section>

      <section className="panel checklist-panel">
        <div>
          <p className="eyebrow">Quick checks</p>
          <h2>What this project already does</h2>
        </div>
        <ul className="checklist">
          {quickChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel instructions-panel">
        <div>
          <p className="eyebrow">Runbook</p>
          <h2>How to use it</h2>
        </div>

        <div className="instructions-grid">
          <article>
            <h3>1. Preview</h3>
            <pre>npm run dev</pre>
            <p>Open the local UI at http://localhost:5173.</p>
          </article>
          <article>
            <h3>2. Worker</h3>
            <pre>npm run worker -- --brief "..."</pre>
            <p>Runs structure → ui → research → review → polish through OpenCode.</p>
          </article>
          <article>
            <h3>3. OpenCode</h3>
            <pre>opencode .</pre>
            <p>Use the project config from opencode.json before launching a session.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default HomePage