import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { sessionsRouter } from './routes/sessions.js'
import { turnsRouter } from './routes/turns.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requireApiSecret } from './middleware/auth.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.static('public'))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: config.openaiModel })
})

// Health check stays open (no session data, useful for uptime probes) —
// everything under /api/sessions requires the shared secret.
app.use('/api/sessions', requireApiSecret, sessionsRouter)
app.use('/api/sessions', requireApiSecret, turnsRouter)

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`)
})
