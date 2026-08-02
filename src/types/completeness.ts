import type { DefinitionSectionKey } from './applicationDefinition'

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
  fees: 'missing',
  notifications: 'missing',
  overall: 0,
}
