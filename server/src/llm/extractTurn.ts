import { runRouter } from './router.js'
import { runDomainAgent } from './domainAgents.js'
import { mergeDomainResults } from '../domain/mergeDomainResults.js'
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

// Orchestrator, as of Sprint 2 — replaces the single unified call from
// Sprint 1. Router first (cheap, classification only) → concurrent domain
// specialist call(s) only for whichever domains it flagged → code-level
// merge. External contract (routes/turns.ts) is unchanged: same function
// name, same result shape, still stateless per call (no previous_response_id
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
  // until the next turn, once the user has answered.
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
  // covers it; no specialist call needed.
  if (routed.domains.length === 0) {
    return {
      reply: routed.reply,
      clarifyingQuestion: null,
      suggestedReplies: routed.suggestedReplies,
      definition: currentDefinition,
      extractionNotes: null,
    }
  }

  // Concurrent, not sequential — bounds latency to roughly one extra
  // round-trip beyond Sprint 1's single call, not one full round-trip per
  // domain. Usually just one domain; the real Bissau finding that one
  // document can carry both a Checklist item and a Fee component at once is
  // exactly the case where more than one runs here.
  const results = await Promise.all(
    routed.domains.map((domain) => runDomainAgent(domain, currentDefinition, transcript, message, files)),
  )

  return mergeDomainResults(currentDefinition, results)
}
