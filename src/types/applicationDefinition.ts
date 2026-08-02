export interface RegistryField {
  id: string
  label: string
  type: 'text' | 'date' | 'dropdown'
  required?: boolean
  visibleWhen?: Record<string, boolean>
}

export interface RegistrySection {
  id: string
  title: string
  conditional?: boolean
  fields: RegistryField[]
}

export interface WorkflowState {
  id: string
  label: string
  assignedRole?: string
}

export interface WorkflowTransition {
  from: string
  to: string
}

export interface FeeRule {
  id: string
  condition: string
  amount: number
}

export interface NotificationRule {
  id: string
  event: string
  channel: string
  recipient: string
}

export interface Metadata {
  name?: string
  description?: string
  department?: string
  applicantType?: string
  version?: string
}

export interface ApplicationDefinition {
  metadata: Metadata
  registry: { sections: RegistrySection[] }
  workflow: { states: WorkflowState[]; transitions: WorkflowTransition[] }
  roles: string[]
  fees: { rules: FeeRule[] }
  notifications: { rules: NotificationRule[] }
  settings: { draft: boolean; published: boolean; language: string }
}

export const EMPTY_APPLICATION_DEFINITION: ApplicationDefinition = {
  metadata: {},
  registry: { sections: [] },
  workflow: { states: [], transitions: [] },
  roles: [],
  fees: { rules: [] },
  notifications: { rules: [] },
  settings: { draft: true, published: false, language: 'English' },
}

export type DefinitionSectionKey =
  | 'metadata'
  | 'registry'
  | 'workflow'
  | 'roles'
  | 'fees'
  | 'notifications'
