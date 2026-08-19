import type { ErrorRequestHandler } from 'express'
import multer from 'multer'
import { ExtractionError } from '../llm/errors.js'

// Real gap this closes: a MulterError (too many files, one file too large)
// used to fall through to the generic 500 below with no readable message —
// exactly what silently swallowed an 8-file dump upload that exceeded the
// old 4-file cap, with nothing in the UI explaining why nothing extracted.
const MULTER_MESSAGE: Partial<Record<string, string>> = {
  LIMIT_FILE_COUNT: 'Too many files attached at once — attach fewer files, or split them across more than one turn.',
  LIMIT_FILE_SIZE: 'One of the attached files is too large (15MB max per file).',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field in the upload.',
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: 'Upload rejected', message: MULTER_MESSAGE[err.code] ?? err.message })
    return
  }

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
