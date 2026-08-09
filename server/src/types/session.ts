import type { ApplicationDefinition, DefinitionSectionKey } from './applicationDefinition.js'
import type { CompletenessSnapshot } from './completeness.js'
import type { ValidationCheck } from './compilation.js'

export type MessageRole = 'administrator' | 'ai' | 'system'

export interface ConversationMessage {
  id: string
  role: MessageRole
  text: string
  suggestedReplies?: string[]
}

// Read-only snapshot of steps 1-4 (Account Settings/Branding/Boundary/Integrations) —
// AI mode never writes these, only reads them as context so it doesn't reinvent or
// contradict what's already configured (currency for Fees, boundary levels for
// Registry, which Notification channels are actually enabled).
export interface SessionContext {
  country?: string
  currency?: string
  boundaryLevels?: string[]
  enabledChannels?: string[]
}

export interface ChatSession {
  sessionId: string
  definition: ApplicationDefinition
  completeness: CompletenessSnapshot
  messages: ConversationMessage[]
  dismissedTemplateIds: string[]
  context?: SessionContext
}

export interface TemplateSuggestionDomainNote {
  domain: string
  status: 'match' | 'tweak' | 'missing'
  note: string
}

// matchPercent/domainNotes replaced the old fixed similarity stub — a real
// per-domain gap analysis now, not a placeholder number. See
// llm/templateSuggestion.ts.
export interface TemplateSuggestion {
  id: string
  name: string
  description: string
  matchPercent: number
  reply: string
  domainNotes: TemplateSuggestionDomainNote[]
}

export interface TurnResponse {
  message: ConversationMessage
  definition: ApplicationDefinition
  completeness: CompletenessSnapshot
  referenceChecks: ValidationCheck[]
  highlightPaths: DefinitionSectionKey[]
  templateSuggestions: TemplateSuggestion[]
}
