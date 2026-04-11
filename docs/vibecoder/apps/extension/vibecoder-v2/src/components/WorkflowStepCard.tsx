import type { WorkflowStep } from '../types/workflow'

type WorkflowStepCardProps = {
  step: WorkflowStep
  index: number
}

function WorkflowStepCard({ step, index }: WorkflowStepCardProps) {
  return (
    <article className="step-card">
      <div className="step-card__top">
        <span className="step-card__index">0{index + 1}</span>
        <span className="step-card__role">{step.role}</span>
      </div>
      <h3>{step.title}</h3>
      <p className="step-card__description">{step.description}</p>
      <dl className="step-card__details">
        <div>
          <dt>Prompt</dt>
          <dd>{step.promptFile}</dd>
        </div>
        <div>
          <dt>Focus</dt>
          <dd>{step.focus}</dd>
        </div>
        <div>
          <dt>Command</dt>
          <dd>{step.commandHint}</dd>
        </div>
      </dl>
    </article>
  )
}

export default WorkflowStepCard