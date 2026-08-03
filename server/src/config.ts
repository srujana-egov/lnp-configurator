import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name} (see .env.example)`)
  }
  return value
}

export const config = {
  openaiApiKey: required('OPENAI_API_KEY'),
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-5.6-terra',
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  port: Number(process.env.PORT ?? 8787),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
