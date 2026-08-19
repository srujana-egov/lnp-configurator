import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { DomainAgentResult } from '../llm/domainAgents.js'
import type { RoutableDomain } from '../schemas/routerSchema.js'
import { enforceMandatoryDefaults, dedupeSectionsByKind, enforceRenewalModuleConsistency } from './mandatoryDefaults.js'
import { reconcileIds } from './reconcileIds.js'
import { diffDefinitions } from './diff.js'

export interface MergedTurnResult {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  extractionNotes: string | null
  definition: ApplicationDefinition
  highlightPaths: RoutableDomain[]
}

const DOMAIN_SCREEN_LABEL: Partial<Record<RoutableDomain, string>> = {
  metadata: 'Metadata',
  overallConfiguration: 'Overall Configuration',
  registry: 'Application Form',
  workflow: 'Workflow',
  roles: 'Roles',
  checklists: 'Checklist',
  fees: 'Fees',
  notifications: 'Notifications',
  otherInformation: 'Other Information',
}

// One real document or message can legitimately touch more than one
// domain at once (a fee amount printed right on an application form, a
// field-inspection report that's both a Checklist item and a Fee line —
// real, deliberate, not a misclassification). That's still true here —
// nothing about the extraction changes. What changes is what gets SHOWN:
// every step now has its own dedicated screen, so dumping a different
// domain's full explanation onto the screen you're actually looking at is
// the same out-of-scope problem already fixed for the proactive nudge. A
// non-focus domain's result still gets applied to the definition in full
// — just summarized as a one-line pointer here instead of narrated.
function buildScopedResult(
  results: DomainAgentResult[],
  focusDomain?: RoutableDomain,
): { reply: string; clarifyingQuestion: string | null; suggestedReplies: string[] } {
  if (!focusDomain) {
    return {
      reply: results.map((r) => r.reply).join('\n\n'),
      clarifyingQuestion: results.map((r) => r.clarifyingQuestion).find((q): q is string => q !== null) ?? null,
      suggestedReplies: results.flatMap((r) => r.suggestedReplies),
    }
  }

  const focusResult = results.find((r) => r.domain === focusDomain)
  const reply = results
    .map((r) =>
      r.domain === focusDomain ? r.reply : `(This also updated ${DOMAIN_SCREEN_LABEL[r.domain] ?? r.domain} — see that screen for details.)`,
    )
    .join('\n\n')

  // A non-focus domain's own pending clarifying question is still real
  // and must not be silently dropped just because its explanation was
  // summarized above — surface it, clearly labeled as belonging to a
  // different screen, rather than lose it.
  const clarifyingSource =
    focusResult?.clarifyingQuestion != null ? focusResult : results.find((r) => r.domain !== focusDomain && r.clarifyingQuestion != null)
  const clarifyingQuestion = clarifyingSource
    ? clarifyingSource.domain === focusDomain
      ? clarifyingSource.clarifyingQuestion
      : `(${DOMAIN_SCREEN_LABEL[clarifyingSource.domain] ?? clarifyingSource.domain}) ${clarifyingSource.clarifyingQuestion}`
    : null
  const suggestedReplies = clarifyingSource ? clarifyingSource.suggestedReplies : focusResult?.suggestedReplies ?? []

  return { reply, clarifyingQuestion, suggestedReplies }
}

// Code, not a model call — replaces just the domains that were actually
// touched this turn, carrying every other domain over unchanged. Reuses each
// result's own applyTo (built in domainAgents.ts from the same per-domain
// converters toCanonical.ts already exports), so there's no duplicated
// per-domain assembly logic here.
export function mergeDomainResults(
  currentDefinition: ApplicationDefinition,
  results: DomainAgentResult[],
  focusDomain?: RoutableDomain,
): MergedTurnResult {
  let definition = currentDefinition
  for (const result of results) {
    definition = result.applyTo(definition)
  }
  definition = enforceMandatoryDefaults(definition)
  definition = dedupeSectionsByKind(definition)
  definition = enforceRenewalModuleConsistency(definition)
  // Stable ids before diffing — otherwise every untouched sibling item's
  // freshly-minted id (see reconcileIds.ts) would make it look modified.
  definition = reconcileIds(currentDefinition, definition)

  const { reply, clarifyingQuestion, suggestedReplies } = buildScopedResult(results, focusDomain)
  const extractionNotes = results.map((r) => r.extractionNotes).filter((n): n is string => n !== null).join('\n') || null
  const highlightPaths = diffDefinitions(currentDefinition, definition)

  return { reply, clarifyingQuestion, suggestedReplies, extractionNotes, definition, highlightPaths }
}
