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
