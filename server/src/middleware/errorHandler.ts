import type { ErrorRequestHandler } from 'express'
import { ExtractionError } from '../llm/errors.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)

  if (err instanceof ExtractionError) {
    res.status(502).json({ error: 'Extraction failed', message: err.message })
    return
  }

  if (err instanceof Error && err.message.startsWith('Unsupported file type')) {
    res.status(400).json({ error: 'Bad request', message: err.message })
    return
  }

  res.status(500).json({ error: 'Internal server error' })
}
