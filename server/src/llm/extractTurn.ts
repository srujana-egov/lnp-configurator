import { runRouter } from './router.js'
import { runDomainAgent } from './domainAgents.js'
import { runNextStepSuggestion } from './nextStepSuggestion.js'
import { mergeDomainResults } from '../domain/mergeDomainResults.js'
import { computeCompleteness } from '../domain/completeness.js'
import type { UploadedFile } from './promptBuilder.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'

export interface RunTurnResult {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  definition: ApplicationDefinition
  extractionNotes: string | null
}

// Appends a proactive nudge toward the next incomplete domain — the direct
// answer to "is it fair to assume a user will type up structured info
// unprompted" (no, so the AI has to be the one bringing up what's still
// missing, like a wizard's next screen appearing on its own). Only called
// from paths that don't already have a pending clarifyingQuestion — never
// stack two questions in one turn, that's the concrete "naggy" failure
// mode this could otherwise fall into.
async function withProactiveNudge(result: RunTurnResult, transcript: ConversationMessage[]): Promise<RunTurnResult> {
  const nudge = await runNextStepSuggestion(result.definition, computeCompleteness(result.definition), transcript)
  return {
    ...result,
    reply: `${result.reply}\n\n${nudge.reply}`,
    suggestedReplies: nudge.suggestedReplies,
  }
}

// Orchestrator, as of Sprint 2 — replaces the single unified call from
// Sprint 1. Router first (cheap, classification only) → concurrent domain
// specialist call(s) only for whichever domains it flagged → code-level
// merge → proactive nudge if nothing else is already asking a question.
// External contract (routes/turns.ts) is unchanged: same function name,
// same result shape, still stateless per call (no previous_response_id
// chaining — sessionStore remains the sole source of truth).
export async function runTurn(
  currentDefinition: ApplicationDefinition,
  transcript: ConversationMessage[],
  message: string,
  files: UploadedFile[],
): Promise<RunTurnResult> {
  const routed = await runRouter(transcript, message, files)

  // Feedback #1 from the Sprint 1 demo ("why assume the classification
  // logic — just ask the user"): the router asks instead of guessing when
  // it isn't confident, and the turn stops here — no domain specialist runs
  // until the next turn, once the user has answered. Already a question —
  // no proactive nudge on top of it.
  if (routed.clarifyingQuestion) {
    return {
      reply: routed.reply,
      clarifyingQuestion: routed.clarifyingQuestion,
      suggestedReplies: routed.suggestedReplies,
      definition: currentDefinition,
      extractionNotes: null,
    }
  }

  // Nothing to route (off-topic input) — the router's own reply already
  // covers it; no specialist call needed, and no question is pending, so
  // this is exactly the moment to proactively redirect toward what's next.
  if (routed.domains.length === 0) {
    return withProactiveNudge(
      { reply: routed.reply, clarifyingQuestion: null, suggestedReplies: routed.suggestedReplies, definition: currentDefinition, extractionNotes: null },
      transcript,
    )
  }

  // Concurrent, not sequential — bounds latency to roughly one extra
  // round-trip beyond Sprint 1's single call, not one full round-trip per
  // domain. Usually just one domain; the real Bissau finding that one
  // document can carry both a Checklist item and a Fee component at once is
  // exactly the case where more than one runs here.
  const results = await Promise.all(
    routed.domains.map((domain) => runDomainAgent(domain, currentDefinition, transcript, message, files)),
  )

  const merged = mergeDomainResults(currentDefinition, results)
  // A domain specialist already needed to ask something (e.g. a hollow
  // checklist/fee-matrix guard) — don't stack a second question on top.
  if (merged.clarifyingQuestion) {
    return merged
  }
  return withProactiveNudge(merged, transcript)
}
