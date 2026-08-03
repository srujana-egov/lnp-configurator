import type { DefinitionSectionKey } from './applicationDefinition.js'

export type SectionStatus = 'complete' | 'partial' | 'missing'

export type CompletenessChecklist = Record<DefinitionSectionKey, SectionStatus>

export interface CompletenessSnapshot extends CompletenessChecklist {
  overall: number
}

export const EMPTY_COMPLETENESS: CompletenessSnapshot = {
  metadata: 'missing',
  registry: 'missing',
  workflow: 'missing',
  roles: 'missing',
  checklists: 'missing',
  fees: 'missing',
  notifications: 'missing',
  overall: 0,
}
