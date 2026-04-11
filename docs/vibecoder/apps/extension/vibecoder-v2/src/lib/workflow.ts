import type { WorkflowRole, WorkflowStep } from '../types/workflow'

export const workflowOrder: WorkflowRole[] = ['structure', 'ui', 'research', 'review', 'polish']

export const workflowSteps: WorkflowStep[] = [
  {
    role: 'structure',
    title: 'Structure agent',
    description: 'Builds the page skeleton, section flow, and data shape.',
    promptFile: 'prompts/structure.md',
    commandHint: 'Owns layout and component boundaries only.',
    focus: 'App shell, routes, sections, reusable pieces',
  },
  {
    role: 'ui',
    title: 'UI agent',
    description: 'Sharpens hierarchy, spacing, rhythm, and visual weight.',
    promptFile: 'prompts/ui.md',
    commandHint: 'Turns structure into a readable interface.',
    focus: 'Typography, spacing, layout emphasis, one hook',
  },
  {
    role: 'research',
    title: 'Research agent',
    description: 'Replaces placeholders with factual, useful, verifiable content.',
    promptFile: 'prompts/research.md',
    commandHint: 'Collects copy, facts, labels, and reference links.',
    focus: 'Claims, copy, URLs, missing real-world context',
  },
  {
    role: 'review',
    title: 'Review agent',
    description: 'Finds high-impact bugs, weak spots, and rough edges.',
    promptFile: 'prompts/review.md',
    commandHint: 'Checks correctness before final polish.',
    focus: 'Risk, edge cases, accessibility, obvious bugs',
  },
  {
    role: 'polish',
    title: 'Polish agent',
    description: 'Cleans up the remaining visible issues and finishes the demo.',
    promptFile: 'prompts/polish.md',
    commandHint: 'Final pass on the highest value fixes.',
    focus: 'Spacing, copy, minor logic, demo readiness',
  },
]

export function getWorkerCommand(brief: string): string {
  return `npm run worker -- --brief ${shellQuote(brief)}`
}

export function getRoleLabel(role: WorkflowRole): string {
  return workflowSteps.find((step) => step.role === role)?.title ?? role
}

export function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`
}