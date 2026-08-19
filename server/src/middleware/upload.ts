import multer from 'multer'

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

// files: 12 — a real dump (the whole point of the dump screen) can
// legitimately carry a dozen-plus small documents at once (a bilingual
// tenant's forms alone can be 2 files each); 4 silently rejected a real
// 8-document upload with no visible error reaching the user (see
// errorHandler.ts's explicit MulterError handling for the case where
// someone still exceeds this).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error(`Unsupported file type: ${file.mimetype}`))
      return
    }
    callback(null, true)
  },
})
