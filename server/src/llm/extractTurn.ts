import { runRouter } from './router.js'
import { runDomainAgent } from './domainAgents.js'
import { runNextStepSuggestion } from './nextStepSuggestion.js'
import { mergeDomainResults } from '../domain/mergeDomainResults.js'
import { computeCompleteness } from '../domain/completeness.js'
import type { UploadedFile } from './promptBuilder.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import type { ConversationMessage } from '../types/session.js'
import { DEEP_EXTRACTION_DOMAINS, type RoutableDomain } from '../schemas/routerSchema.js'

export interface RunTurnResult {
  reply: string
  clarifyingQuestion: string | null
  suggestedReplies: string[]
  definition: ApplicationDefinition
  extractionNotes: string | null
  highlightPaths: RoutableDomain[]
  feesClarifyStreak: number
}

// Two guided rounds, then the third turn falls back to the screen — the
// architect's own explicit rule for Fees specifically (never for the other
// deep-extraction domains), because Fees is the one place a wrong AI
// judgment is a real financial mistake, not a cosmetic one. Enforced here
// in code, not left to the model to self-count: an LLM miscounting its own
// clarifying-question streak is exactly the failure mode this exists to
// prevent, not something to trust it to police itself.
const FEES_CLARIFY_ESCALATION_LIMIT = 2

// Appends a proactive nudge toward the next incomplete domain — the direct
// answer to "is it fair to assume a user will type up structured info
// unprompted" (no, so the AI has to be the one bringing up what's still
// missing, like a wizard's next screen appearing on its own). Only called
// from paths that don't already have a pending clarifyingQuestion — never
// stack two questions in one turn, that's the concrete "naggy" failure
// mode this could otherwise fall into.
async function withProactiveNudge(
  result: RunTurnResult,
  transcript: ConversationMessage[],
  focusDomain?: RoutableDomain,
): Promise<RunTurnResult> {
  const nudge = await runNextStepSuggestion(result.definition, computeCompleteness(result.definition), transcript, focusDomain)
  // A focused nudge with nothing to add (the domain's already complete)
  // comes back with no suggestedReplies — append the note but don't
  // clutter the reply with a redundant "looks complete" on top of
  // whatever the turn itself already said, if there's nothing further.
  if (focusDomain && nudge.suggestedReplies.length === 0) {
    return result
  }
  return {
    ...result,
    reply: `${result.reply}\n\n${nudge.reply}`,
    suggestedReplies: nudge.suggestedReplies,
  }
}

const FEES_ESCALATION_MESSAGE =
  'This fee logic hasn\'t resolved after two clarifying rounds — rather than go a third round in chat, click "🛠 Switch to manual mode" above and finish it directly on the matrix/slab builder there. Whatever\'s already real stays as-is; the screen picks up from here.'

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
  feesClarifyStreak = 0,
  focusDomain?: RoutableDomain,
): Promise<RunTurnResult> {
  const routed = await runRouter(transcript, message, files)

  // Feedback #1 from the Sprint 1 demo ("why assume the classification
  // logic — just ask the user"): the router asks instead of guessing when
  // it isn't confident, and the turn stops here — no domain specialist runs
  // until the next turn, once the user has answered. Already a question —
  // no proactive nudge on top of it. Nothing fees-specific happened at this
  // level, so the streak passes through unchanged.
  if (routed.clarifyingQuestion) {
    return {
      reply: routed.reply,
      clarifyingQuestion: routed.clarifyingQuestion,
      suggestedReplies: routed.suggestedReplies,
      definition: currentDefinition,
      extractionNotes: null,
      highlightPaths: [],
      feesClarifyStreak,
    }
  }

  // The hard, code-enforced filter — not a prompt-level request the router
  // could get wrong. A message about Workflow/Roles/Checklists/Notifications/
  // Overall Configuration is still classified by the router (free-form
  // "type whatever you know" input keeps working), but never reaches a
  // specialist call: those five domains are screen-only now, structurally
  // guaranteed to never touch the AI provider, not just asked nicely not to.
  const deepDomains = routed.domains.filter((d) => DEEP_EXTRACTION_DOMAINS.includes(d))

  // Nothing needing deep extraction (off-topic input, or the message only
  // touched screen-only domains) — the router's own reply already covers
  // it (including any real "go configure that on the X screen" pointer),
  // no specialist call needed, and no question is pending, so this is
  // exactly the moment to proactively redirect toward what's next.
  if (deepDomains.length === 0) {
    return withProactiveNudge(
      { reply: routed.reply, clarifyingQuestion: null, suggestedReplies: routed.suggestedReplies, definition: currentDefinition, extractionNotes: null, highlightPaths: [], feesClarifyStreak },
      transcript,
      focusDomain,
    )
  }

  // Fees escalation gate — two guided clarifying rounds (each capped at one
  // question per turn by the domain agent's own hard rules) already
  // happened without resolving; a third round doesn't run the specialist at
  // all, structurally, the same way a screen-only domain never does.
  const feesEscalated = deepDomains.includes('fees') && feesClarifyStreak >= FEES_CLARIFY_ESCALATION_LIMIT
  const domainsToRun = feesEscalated ? deepDomains.filter((d) => d !== 'fees') : deepDomains

  if (feesEscalated && domainsToRun.length === 0) {
    // Fees was the only deep domain this turn — nothing left to extract,
    // so skip the specialist/merge machinery entirely rather than merge an
    // empty result set.
    const screenOnlyDomains = routed.domains.filter((d) => !DEEP_EXTRACTION_DOMAINS.includes(d))
    const reply = screenOnlyDomains.length > 0 ? `${routed.reply}\n\n${FEES_ESCALATION_MESSAGE}` : FEES_ESCALATION_MESSAGE
    return withProactiveNudge(
      { reply, clarifyingQuestion: null, suggestedReplies: [], definition: currentDefinition, extractionNotes: null, highlightPaths: [], feesClarifyStreak: 0 },
      transcript,
      focusDomain,
    )
  }

  // Concurrent, not sequential — bounds latency to roughly one extra
  // round-trip beyond Sprint 1's single call, not one full round-trip per
  // domain. Usually just one domain; the real Bissau finding that one
  // document can carry both a Checklist item and a Fee component at once is
  // exactly the case where more than one runs here.
  const results = await Promise.all(
    domainsToRun.map((domain) => runDomainAgent(domain, currentDefinition, transcript, message, files)),
  )

  const feesResult = results.find((r) => r.domain === 'fees')
  const nextFeesClarifyStreak = feesEscalated
    ? 0
    : feesResult
      ? feesResult.clarifyingQuestion
        ? feesClarifyStreak + 1
        : 0
      : feesClarifyStreak

  const merged = mergeDomainResults(currentDefinition, results, focusDomain)
  // Real bug caught live: when a turn touches a screen-only domain
  // alongside a deep one (e.g. a Form field and a Workflow detail in the
  // same message), the merged reply below is built purely from the
  // specialists' own replies — routed.reply (which carries the router's
  // "go configure that on the Workflow screen" acknowledgment) would
  // otherwise be silently discarded, and that acknowledgment would never
  // reach the user at all. Prepend it whenever screen-only domains were
  // also flagged, regardless of whether deep extraction also ran.
  const screenOnlyDomains = routed.domains.filter((d) => !DEEP_EXTRACTION_DOMAINS.includes(d))
  let reply = screenOnlyDomains.length > 0 ? `${routed.reply}\n\n${merged.reply}` : merged.reply
  // fees was escalated but another deep domain also ran this turn (e.g. a
  // Form field alongside fee logic) — still surface the escalation
  // alongside whatever else genuinely extracted.
  if (feesEscalated) reply = `${reply}\n\n${FEES_ESCALATION_MESSAGE}`
  const mergedWithReply = { ...merged, reply, feesClarifyStreak: nextFeesClarifyStreak }

  // A domain specialist already needed to ask something (e.g. a hollow
  // checklist/fee-matrix guard) — don't stack a second question on top.
  if (mergedWithReply.clarifyingQuestion) {
    return mergedWithReply
  }
  return withProactiveNudge(mergedWithReply, transcript, focusDomain)
}
