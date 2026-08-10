import type { RequestHandler } from 'express'
import { config } from '../config.js'

// Single shared secret, not per-user auth — there's no concept of a user in
// this backend. This only closes "any caller can read/write any session";
// it does not add tenant isolation or per-user permissions.
export const requireApiSecret: RequestHandler = (req, res, next) => {
  const header = req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token || token !== config.apiSharedSecret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}
