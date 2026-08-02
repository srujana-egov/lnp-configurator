import type { ApplicationDefinition } from './applicationDefinition'
import type { CompletenessSnapshot } from './completeness'
import type { ArchitectureComponentId } from './architecture'

export type MessageRole = 'administrator' | 'ai' | 'system'

export interface ConversationMessage {
  id: string
  role: MessageRole
  text: string
  suggestedReplies?: string[]
}

export interface ScenarioOperation {
  id: string
  type: string
  description: string
  target: string
  result: string
}

export type TimelineStageId =
  | 'conversation'
  | 'understanding'
  | 'operations'
  | 'definition'
  | 'validation'
  | 'compilation'
  | 'deployment'

export interface ExtractedEntity {
  text: string
  destination: string
}

export interface ScenarioBeat {
  id: string
  activeComponent: ArchitectureComponentId
  timelineStage: TimelineStageId
  message?: ConversationMessage
  extracted?: ExtractedEntity[]
  operations?: ScenarioOperation[]
  applyPatch?: (definition: ApplicationDefinition) => ApplicationDefinition
  highlightPaths?: string[]
  completeness?: CompletenessSnapshot
  waitsForUser?: boolean
}

export type ScenarioId = 'birth-certificate' | 'validation-error'

export interface ScenarioMeta {
  id: ScenarioId
  title: string
  description: string
  expectedOutcome: 'success' | 'failure'
  beats: ScenarioBeat[]
}
