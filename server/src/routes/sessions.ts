import { Router } from 'express'
import { createSession, getSession, saveSession } from '../store/sessionStore.js'
import { suggestTemplate } from '../templates/match.js'
import { runNextStepSuggestion } from '../llm/nextStepSuggestion.js'
import type { ConversationMessage } from '../types/session.js'

export const sessionsRouter = Router()

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

    const suggestion = await runNextStepSuggestion(session.definition, session.completeness, [])
    const welcomeMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: suggestion.reply,
      suggestedReplies: suggestion.suggestedReplies.length > 0 ? suggestion.suggestedReplies : undefined,
    }
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
