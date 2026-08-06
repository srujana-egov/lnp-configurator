import { Router } from 'express'
import { createSession, getSession } from '../store/sessionStore.js'
import { suggestTemplate } from '../templates/match.js'

export const sessionsRouter = Router()

// Sprint 1 demo feedback #2: an optional templateId lets a session start
// from a template instead of a blank dump — see sessionStore.ts.
sessionsRouter.post('/', (req, res) => {
  const templateId = typeof req.body?.templateId === 'string' ? req.body.templateId : undefined
  res.json(createSession(templateId))
})

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(session)
})

// Stubbed real matching (see templates/match.ts) — the point of this route
// is the clickable, discoverable affordance itself (feedback #2), even
// before the embedding-based matching behind it is real.
sessionsRouter.post('/:sessionId/suggest-template', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json({ suggestion: suggestTemplate(session.definition) })
})
