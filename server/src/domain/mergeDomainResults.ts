import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { DomainAgentResult } from '../llm/domainAgents.js'
import { enforceMandatoryDefaults } from './mandatoryDefaults.js'

export interface MergedTurnResult {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  extractionNotes: string | null
  definition: ApplicationDefinition
}

// Code, not a model call — replaces just the domains that were actually
// touched this turn, carrying every other domain over unchanged. Reuses each
// result's own applyTo (built in domainAgents.ts from the same per-domain
// converters toCanonical.ts already exports), so there's no duplicated
// per-domain assembly logic here.
export function mergeDomainResults(
  currentDefinition: ApplicationDefinition,
  results: DomainAgentResult[],
): MergedTurnResult {
  let definition = currentDefinition
  for (const result of results) {
    definition = result.applyTo(definition)
  }
  definition = enforceMandatoryDefaults(definition)

  const reply = results.map((r) => r.reply).join('\n\n')
  const clarifyingQuestion = results.map((r) => r.clarifyingQuestion).find((q): q is string => q !== null) ?? null
  const suggestedReplies = results.flatMap((r) => r.suggestedReplies)
  const extractionNotes = results.map((r) => r.extractionNotes).filter((n): n is string => n !== null).join('\n') || null

  return { reply, clarifyingQuestion, suggestedReplies, extractionNotes, definition }
}
