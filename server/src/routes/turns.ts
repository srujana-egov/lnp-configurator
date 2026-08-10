import { Router } from 'express'
import { getSession, saveSession } from '../store/sessionStore.js'
import { upload } from '../middleware/upload.js'
import { runTurn } from '../llm/extractTurn.js'
import { computeCompleteness } from '../domain/completeness.js'
import type { ConversationMessage, TurnResponse } from '../types/session.js'

export const turnsRouter = Router()

turnsRouter.post('/:sessionId/turns', upload.array('files', 4), async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId
    if (typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Invalid session id' })
      return
    }
    const session = getSession(sessionId)
    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (!message && files.length === 0) {
      res.status(400).json({ error: 'Provide a message or at least one file' })
      return
    }

    const administratorMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'administrator',
      text: message || `(attached ${files.length} file${files.length === 1 ? '' : 's'})`,
    }
    session.messages.push(administratorMessage)

    const result = await runTurn(
      session.definition,
      session.messages,
      message,
      files.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        base64: f.buffer.toString('base64'),
      })),
    )

    // clarifyingQuestion was being silently dropped here — caught during the real
    // Sprint 1 test, not by tsc. ConversationMessage has no dedicated slot for it,
    // so append it to the reply text rather than lose it.
    const text = result.clarifyingQuestion ? `${result.reply}\n\n${result.clarifyingQuestion}` : result.reply

    const aiMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text,
      suggestedReplies: result.suggestedReplies.length > 0 ? result.suggestedReplies : undefined,
    }
    session.messages.push(aiMessage)
    session.definition = result.definition
    session.completeness = computeCompleteness(session.definition)
    saveSession(session)

    const response: TurnResponse = {
      message: aiMessage,
      definition: session.definition,
      completeness: session.completeness,
      // referenceChecks/highlightPaths/templateSuggestions are still real
      // gaps (Reference Resolver, id-stability) — placeholders here on
      // purpose, not forgotten.
      referenceChecks: [],
      highlightPaths: [],
      templateSuggestions: [],
    }
    res.json(response)
  } catch (err) {
    next(err)
  }
})
