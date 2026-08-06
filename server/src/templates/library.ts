import type { ApplicationDefinition } from '../types/applicationDefinition.js'
import { EMPTY_APPLICATION_DEFINITION } from '../types/applicationDefinition.js'
import { buildMandatoryDefaultSections } from '../domain/mandatoryDefaults.js'
import { freshId } from '../schemas/toCanonical.js'

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  definition: ApplicationDefinition
}

// Sprint 1 demo feedback #2: people start from a template and tweak, not
// always from a blank dump — this is the plumbing for that entry point.
// Real embedding-based matching against a real library is still Sprint 5
// (templates/match.ts is a stub for now, see below); this one seed template
// exists so the entry point is genuinely clickable and demoable already.
//
// OPEN ITEM: this is a reasonable approximation of the real Business
// License form, not a byte-for-byte copy of Sprint 1's actual tested
// extraction output — the one confirmed-real detail baked in is the
// document list ("Copy of Identity Card, Copy of NIF, Proof of deposit"),
// taken directly from the real fixture. Refine the rest against the actual
// Sprint 1 test transcript if this needs to be demo-accurate later.
function buildBusinessLicenseTemplate(): ApplicationDefinition {
  return {
    ...EMPTY_APPLICATION_DEFINITION,
    metadata: {
      name: 'Business License',
      description: 'Application for Authorization to Start Business',
    },
    registry: {
      sections: [
        ...buildMandatoryDefaultSections(),
        {
          id: freshId(),
          title: 'Business Details',
          fields: [
            { id: freshId(), label: 'Business Name', type: 'text', required: true, fieldSource: 'recommended' },
            { id: freshId(), label: 'Business Address', type: 'text', required: true, fieldSource: 'recommended' },
            { id: freshId(), label: 'NIF Number', type: 'text', required: true, fieldSource: 'recommended' },
          ],
        },
      ],
      documents: [
        { documentName: 'Copy of Identity Card', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
        { documentName: 'Copy of NIF', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
        { documentName: 'Proof of Deposit', acceptedFormats: ['PDF', 'JPG', 'PNG'], required: true, docTypes: [] },
      ],
      featureToggles: [],
    },
    roles: ['Citizen', 'Document Verifier', 'Approver'],
  }
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'business-license-starter',
    name: 'Business License',
    description: 'A general business license/permit starter — applicant details, business details, standard identity documents.',
    definition: buildBusinessLicenseTemplate(),
  },
]

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
