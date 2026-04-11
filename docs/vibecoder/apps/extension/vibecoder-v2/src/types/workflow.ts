export type WorkflowRole = 'structure' | 'ui' | 'research' | 'review' | 'polish'

export interface WorkflowStep {
  role: WorkflowRole
  title: string
  description: string
  promptFile: string
  commandHint: string
  focus: string
}