export type ArchitectureComponentId =
  | 'administrator'
  | 'conversation-interface'
  | 'conversation-manager'
  | 'ai-orchestrator'
  | 'understanding-engine'
  | 'structured-operations'
  | 'operation-executor'
  | 'application-definition'
  | 'completeness-engine'
  | 'preview'
  | 'review'
  | 'reference-resolver'
  | 'registry-compiler'
  | 'workflow-compiler'
  | 'fee-compiler'
  | 'notification-compiler'
  | 'generated-files'

export const PHASE_1_COMPONENT_IDS: ArchitectureComponentId[] = [
  'administrator',
  'conversation-interface',
  'conversation-manager',
  'ai-orchestrator',
  'understanding-engine',
  'structured-operations',
  'operation-executor',
  'application-definition',
  'completeness-engine',
  'preview',
  'review',
]

export const PHASE_2_COMPONENT_IDS: ArchitectureComponentId[] = [
  'reference-resolver',
  'registry-compiler',
  'workflow-compiler',
  'fee-compiler',
  'notification-compiler',
  'generated-files',
]

export type ComponentRunStatus = 'inactive' | 'running' | 'completed' | 'failed'

export interface ArchitectureNodeData {
  id: ArchitectureComponentId
  title: string
  description: string
  icon: string
  x: number
  y: number
}

export interface ArchitectureEdgeData {
  id: string
  source: ArchitectureComponentId
  target: ArchitectureComponentId
  loop?: boolean
}

export interface ResearchDrawerContent {
  purpose: string
  inputs: string[]
  outputs: string[]
  responsibilities: string[]
  whyItExists: string
  relatedDecisions: string[]
  example: string
}
