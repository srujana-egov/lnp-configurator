import { Router } from 'express'
import { createSession, getSession, saveSession } from '../store/sessionStore.js'
import { suggestTemplate } from '../templates/match.js'
import { runNextStepSuggestion } from '../llm/nextStepSuggestion.js'
import { answerFromStepKnowledge, hasStepKnowledge } from '../llm/docQa.js'
import { runWelcomeStarters } from '../llm/welcomeStarters.js'
import { computeCompleteness } from '../domain/completeness.js'
import type { ChatSession, ConversationMessage } from '../types/session.js'
import type { ApplicationDefinition } from '../types/applicationDefinition.js'

export const sessionsRouter = Router()

async function buildProactiveWelcome(session: ChatSession): Promise<ConversationMessage> {
  const suggestion = await runNextStepSuggestion(session.definition, session.completeness, [])
  return {
    id: crypto.randomUUID(),
    role: 'ai',
    text: suggestion.reply,
    suggestedReplies: suggestion.suggestedReplies.length > 0 ? suggestion.suggestedReplies : undefined,
  }
}

// Sprint 1 demo feedback #2: an optional templateId lets a session start
// from a template instead of a blank dump — see sessionStore.ts. Now also
// generates a real, context-aware welcome message (the session-start
// trigger for next-step suggestions) before returning — a brand-new user
// gets a nudge immediately instead of a blank/default-filled screen with
// nothing inviting them to explore it.
sessionsRouter.post('/', async (req, res, next) => {
  try {
    const templateId = typeof req.body?.templateId === 'string' ? req.body.templateId : undefined
    const session = createSession(templateId)

    // Real product feedback: an optional module decision (Renewal) must
    // never be silently treated as already answered just because a
    // template happens to include real content for it — completeness
    // would otherwise read 'complete' immediately (the template's real
    // categories are already pre-filled), so the generic proactive nudge
    // below would skip straight past this question and never ask it.
    // Deterministic, not LLM-generated — the real question and its two
    // real options are already known exactly, no need to ask a model.
    const welcomeMessage: ConversationMessage =
      templateId && session.definition.overallConfiguration.modules.renewal
        ? {
            id: crypto.randomUUID(),
            role: 'ai',
            text:
              `This template includes a Renewal module. Will your ${session.definition.metadata.name ?? 'service'} also offer Renewal, ` +
              'or just Issuance? Renewal lets citizens renew an active licence before or after it expires.',
            suggestedReplies: ['Keep Renewal enabled', 'Just Issuance — remove Renewal'],
          }
        : await buildProactiveWelcome(session)
    session.messages.push(welcomeMessage)
    saveSession(session)

    res.json(session)
  } catch (err) {
    next(err)
  }
})

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(session)
})

// Stateless — the pre-session "dump screen" path (describe what you need,
// get a real gap analysis back, before committing to a session at all).
sessionsRouter.post('/suggest-template', async (req, res, next) => {
  try {
    const description = typeof req.body?.description === 'string' ? req.body.description.trim() : ''
    if (!description) {
      res.status(400).json({ error: 'Provide a description' })
      return
    }
    const suggestion = await suggestTemplate({ description })
    res.json({ suggestion })
  } catch (err) {
    next(err)
  }
})

// In-session — real gap analysis against the current definition-so-far,
// not the old fixed-0.75 stub.
sessionsRouter.post('/:sessionId/suggest-template', async (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const suggestion = await suggestTemplate({ definition: session.definition })
    res.json({ suggestion })
  } catch (err) {
    next(err)
  }
})

// Direct, deterministic write — the Overall Configuration wizard is a real
// screen-driven UI, never AI-authored (the architect's original scoping
// call this whole system is built around). This bypasses the LLM entirely:
// the wizard already knows the exact canonical shape it's producing turn by
// turn, so there is nothing here for a specialist to extract from prose.
// No Zod schema validating the body — this is an internal, same-codebase
// client (the wizard), not third-party input; a real public API would want
// one.
sessionsRouter.patch('/:sessionId/overall-configuration', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  const overallConfiguration = req.body as ApplicationDefinition['overallConfiguration']
  session.definition = { ...session.definition, overallConfiguration }
  session.completeness = computeCompleteness(session.definition)
  saveSession(session)
  res.json({ definition: session.definition, completeness: session.completeness })
})

// Same direct-write pattern, for Fees' manual entry mode (the flowchart's
// E1 "direct entry" path) — a human building this on the actual screen
// needs no AI verification step, unlike E2/E3 (upload/chat), which is why
// this always writes needsConfirmation: false rather than inheriting
// whatever the chat-driven flow last left it at.
sessionsRouter.patch('/:sessionId/fees', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  const fees = { ...(req.body as ApplicationDefinition['fees']), needsConfirmation: false }
  session.definition = { ...session.definition, fees }
  session.completeness = computeCompleteness(session.definition)
  saveSession(session)
  res.json({ definition: session.definition, completeness: session.completeness })
})

// A step's corner chat widget — grounded only in that domain's own
// pre-authored reference file (server/src/knowledge/<domain>.md), never
// the session's own definition (a deliberately different, narrower
// contract than the main chat: this is "explain this step," not
// "configure this step"). Deliberately NOT a separate, disconnected
// chatbot: both the question and the answer are pushed into this same
// session's real message history and saved exactly like a normal turn, so
// it's one continuous conversation across every step, not a side-channel
// that disappears when you navigate away.
sessionsRouter.post('/:sessionId/ask-about-step', async (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const domain = typeof req.body?.domain === 'string' ? req.body.domain : ''
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
    if (!question) {
      res.status(400).json({ error: 'Provide a question' })
      return
    }
    if (!hasStepKnowledge(domain)) {
      res.status(404).json({ error: `No reference material configured yet for "${domain}"` })
      return
    }
    const administratorMessage: ConversationMessage = { id: crypto.randomUUID(), role: 'administrator', text: question }
    session.messages.push(administratorMessage)
    const answerText = await answerFromStepKnowledge(domain, question)
    const aiMessage: ConversationMessage = { id: crypto.randomUUID(), role: 'ai', text: answerText }
    session.messages.push(aiMessage)
    saveSession(session)
    res.json({ message: aiMessage })
  } catch (err) {
    next(err)
  }
})

// A step's first-visit welcome screen ("not sure what to type? click one
// to start") — real starter examples grounded in this session's actual
// definition, never generic boilerplate. Stateless: doesn't touch
// session.messages, same as suggest-template.
sessionsRouter.post('/:sessionId/welcome-starters', async (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const domain = typeof req.body?.domain === 'string' ? req.body.domain : ''
    if (!domain) {
      res.status(400).json({ error: 'Provide a domain' })
      return
    }
    const result = await runWelcomeStarters(domain, session.definition)
    res.json({ starters: result.starters })
  } catch (err) {
    next(err)
  }
})

// On-demand re-trigger ("What should I look at next?") — same function as
// the session-start welcome message, but fed the real transcript instead
// of an empty one. Distinct from suggest-template: this reasons over the
// whole current state with no external reference template to compare
// against.
sessionsRouter.post('/:sessionId/next-steps', async (req, res, next) => {
  try {
    const session = getSession(req.params.sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const suggestion = await runNextStepSuggestion(session.definition, session.completeness, session.messages)
    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: suggestion.reply,
      suggestedReplies: suggestion.suggestedReplies.length > 0 ? suggestion.suggestedReplies : undefined,
    }
    session.messages.push(message)
    saveSession(session)
    res.json({ message })
  } catch (err) {
    next(err)
  }
})
