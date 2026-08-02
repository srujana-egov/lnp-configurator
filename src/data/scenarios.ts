import { BIRTH_CERTIFICATE_SCENARIO } from './birthCertificateScenario'
import { VALIDATION_ERROR_SCENARIO } from './validationErrorScenario'
import type { ScenarioId, ScenarioMeta } from '@/types/scenario'

export const SCENARIOS: Record<ScenarioId, ScenarioMeta> = {
  'birth-certificate': {
    id: 'birth-certificate',
    title: 'Birth Certificate',
    description: 'A complete authoring run that ends in a successful deterministic compilation.',
    expectedOutcome: 'success',
    beats: BIRTH_CERTIFICATE_SCENARIO,
  },
  'validation-error': {
    id: 'validation-error',
    title: 'Validation Error',
    description: 'A Trade Licence application whose notification references a workflow state that no longer exists — the Reference Resolver catches it before compilation.',
    expectedOutcome: 'failure',
    beats: VALIDATION_ERROR_SCENARIO,
  },
}

export const DEFAULT_SCENARIO_ID: ScenarioId = 'birth-certificate'
