import { Router } from 'express'
import { createSession, getSession } from '../store/sessionStore.js'

export const sessionsRouter = Router()

sessionsRouter.post('/', (_req, res) => {
  res.json(createSession())
})

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(session)
})
