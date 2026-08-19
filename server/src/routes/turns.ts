import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getSession, saveSession } from '../store/sessionStore.js'
import { upload } from '../middleware/upload.js'
import { runTurn } from '../llm/extractTurn.js'
import { computeCompleteness } from '../domain/completeness.js'
import { resolveReferences } from '../domain/referenceResolver.js'
import { logTurn } from '../observability/turnLog.js'
import { RoutableDomainSchema } from '../schemas/routerSchema.js'
import type { ConversationMessage, TurnResponse } from '../types/session.js'

export const turnsRouter = Router()

// Per-session, not global — the only OpenAI-cost-bearing route, so this is
// specifically about capping runaway cost on one session, not rate-limiting
// the API as a whole. A shared cross-session cap would let one bad/looping
// session starve every other real user, which is worse than the problem
// this is meant to solve.
const turnsRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  // No IP fallback needed or wanted: sessionId is always present here (it's
  // a required segment of this route's own path — Express wouldn't have
  // matched the route otherwise), and express-rate-limit v8 flags any
  // IP-derived key as a potential IPv6 bypass unless routed through its own
  // ipKeyGenerator helper. Sidestep that entirely by never touching req.ip.
  keyGenerator: (req) => String(req.params.sessionId),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many turns for this session — wait a moment and try again.' },
})

turnsRouter.post('/:sessionId/turns', turnsRateLimit, upload.array('files', 12), async (req, res, next) => {
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
    // Which step's screen the user is actually looking at — every step
    // has its own dedicated screen now, so a proactive nudge toward a
    // *different* domain would land on a screen that has nothing to do
    // with it. Absent/invalid falls back to the unscoped global nudge
    // (the pre-session dump, or any caller that doesn't send this yet).
    const focusDomainParse = RoutableDomainSchema.safeParse(req.body?.activeStep)
    const focusDomain = focusDomainParse.success ? focusDomainParse.data : undefined

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
      session.feesClarifyStreak ?? 0,
      focusDomain,
    )
    session.feesClarifyStreak = result.feesClarifyStreak

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
    const completenessBefore = session.completeness
    session.definition = result.definition
    session.completeness = computeCompleteness(session.definition)
    saveSession(session)

    const referenceChecks = resolveReferences(session.definition)
    logTurn({
      sessionId,
      messageLength: message.length,
      fileCount: files.length,
      clarifyingQuestion: result.clarifyingQuestion !== null,
      domainsChanged: result.highlightPaths,
      completenessBefore,
      completenessAfter: session.completeness,
      referenceChecks,
      templateSuggestions: [],
    })

    const response: TurnResponse = {
      message: aiMessage,
      definition: session.definition,
      completeness: session.completeness,
      // referenceChecks is a pure function of the final definition, computed
      // the same way completeness is above — independent of how the turn
      // got here, so it'll run identically once a manual (non-chat) editing
      // path exists too.
      referenceChecks,
      highlightPaths: result.highlightPaths,
      // templateSuggestions: still a real gap — ranking across a library
      // needs more than the one seed template to be meaningful (see plan).
      templateSuggestions: [],
    }
    res.json(response)
  } catch (err) {
    next(err)
  }
})
