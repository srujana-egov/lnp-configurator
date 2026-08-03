// Reference Resolver doesn't start until Sprint 3 — mirrored now since it's
// cheap and the shape is already settled (adapted from src/lib/compilers.ts
// in the frontend prototype).

export type ValidationCheckStatus = 'passed' | 'failed' | 'warning'

export interface ValidationCheck {
  id: string
  label: string
  status: ValidationCheckStatus
}
