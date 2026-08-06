// Shared across router.ts, domainAgents.ts, and extractTurn.ts — pulled out
// of extractTurn.ts so those files can throw it without importing the
// orchestrator itself (extractTurn.ts imports from both of them).
export class ExtractionError extends Error {}
