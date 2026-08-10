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
  // Shared-secret gate for the whole /api surface — not a real user-auth
  // system (there's no concept of a user), just the honest, proportionate
  // fix for "any caller can read/write any session" on an internal tool.
  apiSharedSecret: required('API_SHARED_SECRET'),
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-5.6-terra',
  // Router is pure classification, run every turn — cost-optimized tier on
  // purpose, distinct from the domain-specialist extraction tier above.
  openaiRouterModel: process.env.OPENAI_ROUTER_MODEL ?? 'gpt-5.6-luna',
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  port: Number(process.env.PORT ?? 8787),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
