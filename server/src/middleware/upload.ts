import multer from 'multer'

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error(`Unsupported file type: ${file.mimetype}`))
      return
    }
    callback(null, true)
  },
})
