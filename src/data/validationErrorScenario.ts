import type { ApplicationDefinition } from '@/types/applicationDefinition'
import type { ScenarioBeat } from '@/types/scenario'

let opCounter = 0
function op(type: string, description: string, target: string, result: string) {
  opCounter += 1
  return { id: `verr-op-${opCounter}`, type, description, target, result }
}

function withMetadata(metadata: Partial<ApplicationDefinition['metadata']>) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    metadata: { ...def.metadata, ...metadata },
  })
}

function withRoles(roles: string[]) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    roles: [...def.roles, ...roles.filter((r) => !def.roles.includes(r))],
  })
}

function withWorkflow(states: ApplicationDefinition['workflow']['states'], transitions: ApplicationDefinition['workflow']['transitions']) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    workflow: { states, transitions },
  })
}

function withRegistrySections(sections: ApplicationDefinition['registry']['sections']) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    registry: { sections },
  })
}

function withFeeRules(rules: ApplicationDefinition['fees']['rules']) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    fees: { rules },
  })
}

function withNotificationRules(rules: ApplicationDefinition['notifications']['rules']) {
  return (def: ApplicationDefinition): ApplicationDefinition => ({
    ...def,
    notifications: { rules },
  })
}

/**
 * Deliberately broken scenario: the Notification Compiler input references a workflow
 * state ("Approved") that was renamed to "Verified" upstream but never updated downstream.
 * Phase 1 completeness only checks that notifications exist, not that they resolve — so this
 * reaches Review at 100% and is only caught by Phase 2's Reference Resolver.
 */
export const VALIDATION_ERROR_SCENARIO: ScenarioBeat[] = [
  // ───────────────────────── Turn 1 — initial prompt ─────────────────────────
  {
    id: 'verr-turn1-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'verr-msg-1',
      role: 'administrator',
      text: 'Create a Trade Licence application where business owners apply online. A municipal officer verifies applications through Draft, Submitted and Verified stages.',
    },
  },
  { id: 'verr-turn1-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'verr-turn1-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'verr-turn1-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'verr-turn1-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Create', destination: 'Application' },
      { text: 'Trade Licence', destination: 'Metadata' },
      { text: 'Business owners', destination: 'Applicant' },
      { text: 'Municipal officer', destination: 'Role' },
      { text: 'Draft, Submitted, Verified', destination: 'Workflow' },
    ],
  },
  {
    id: 'verr-turn1-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_APPLICATION', 'Create the Trade Licence application', 'metadata', 'Application "Trade Licence" created'),
      op('CREATE_ROLE', 'Create the Business Owner role', 'roles', 'Role "Business Owner" added'),
      op('CREATE_ROLE', 'Create the Municipal Officer role', 'roles', 'Role "Municipal Officer" added'),
      op('CREATE_WORKFLOW', 'Create the verification workflow', 'workflow', 'States Draft → Submitted → Verified created'),
      op('CREATE_FEE_POLICY', 'Create an empty fee policy placeholder', 'fees', 'Fee policy placeholder created'),
    ],
  },
  {
    id: 'verr-turn1-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['metadata', 'roles', 'workflow', 'fees'],
    applyPatch: (def) =>
      [
        withMetadata({ name: 'Trade Licence', department: 'Municipal Administration', applicantType: 'Business Owner', version: '1.0' }),
        withRoles(['Business Owner', 'Municipal Officer']),
        withWorkflow(
          [
            { id: 'draft', label: 'Draft' },
            { id: 'submitted', label: 'Submitted', assignedRole: 'Municipal Officer' },
            { id: 'verified', label: 'Verified', assignedRole: 'Municipal Officer' },
          ],
          [
            { from: 'draft', to: 'submitted' },
            { from: 'submitted', to: 'verified' },
          ],
        ),
      ].reduce((acc, fn) => fn(acc), def),
  },
  {
    id: 'verr-turn1-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['metadata', 'roles', 'workflow', 'fees'],
  },
  {
    id: 'verr-turn1-completeness-engine',
    activeComponent: 'completeness-engine',
    timelineStage: 'definition',
    completeness: {
      metadata: 'complete',
      registry: 'missing',
      workflow: 'complete',
      roles: 'complete',
      fees: 'partial',
      notifications: 'missing',
      overall: 55,
    },
    message: {
      id: 'verr-msg-2',
      role: 'ai',
      text: 'What information should business owners provide when applying?',
      suggestedReplies: ['Business Name', 'Owner Name', 'Business Address', 'GST Number', 'Contact Number'],
    },
    waitsForUser: true,
  },
  { id: 'verr-turn1-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Turn 2 — registry clarification ─────────────────────────
  {
    id: 'verr-turn2-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'verr-msg-3',
      role: 'administrator',
      text: 'Business Name, Owner Name, Business Address, GST Number.',
    },
  },
  { id: 'verr-turn2-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'verr-turn2-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'verr-turn2-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'verr-turn2-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Business Name', destination: 'Registry Field' },
      { text: 'Owner Name', destination: 'Registry Field' },
      { text: 'Business Address', destination: 'Registry Field' },
      { text: 'GST Number', destination: 'Registry Field' },
    ],
  },
  {
    id: 'verr-turn2-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_SECTION', 'Create the Business Details section', 'registry', 'Section "Business Details" created'),
      op('ADD_FIELD', 'Add the Business Name field', 'registry', 'Field "Business Name" added'),
      op('ADD_FIELD', 'Add the Owner Name field', 'registry', 'Field "Owner Name" added'),
      op('ADD_FIELD', 'Add the Business Address field', 'registry', 'Field "Business Address" added'),
      op('ADD_FIELD', 'Add the GST Number field', 'registry', 'Field "GST Number" added'),
    ],
  },
  {
    id: 'verr-turn2-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['registry'],
    applyPatch: withRegistrySections([
      {
        id: 'business-details',
        title: 'Business Details',
        fields: [
          { id: 'business_name', label: 'Business Name', type: 'text', required: true },
          { id: 'owner_name', label: 'Owner Name', type: 'text', required: true },
          { id: 'business_address', label: 'Business Address', type: 'text', required: true },
          { id: 'gst_number', label: 'GST Number', type: 'text', required: true },
        ],
      },
    ]),
  },
  {
    id: 'verr-turn2-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['registry'],
  },
  {
    id: 'verr-turn2-completeness-engine',
    activeComponent: 'completeness-engine',
    timelineStage: 'definition',
    completeness: {
      metadata: 'complete',
      registry: 'complete',
      workflow: 'complete',
      roles: 'complete',
      fees: 'partial',
      notifications: 'missing',
      overall: 78,
    },
    message: {
      id: 'verr-msg-4',
      role: 'ai',
      text: 'How should the annual licence fee be calculated?',
      suggestedReplies: ['Flat annual fee', 'Based on business size', 'No Fees', 'Custom Rule'],
    },
    waitsForUser: true,
  },
  { id: 'verr-turn2-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Turn 3 — fee clarification ─────────────────────────
  {
    id: 'verr-turn3-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'verr-msg-5',
      role: 'administrator',
      text: 'Flat annual fee of £150.',
    },
  },
  { id: 'verr-turn3-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'verr-turn3-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'verr-turn3-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'verr-turn3-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [{ text: 'Flat annual fee of £150', destination: 'Fee Rule' }],
  },
  {
    id: 'verr-turn3-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [op('CREATE_FEE_RULE', 'Create the annual licence fee rule', 'fees', 'Fee rule "Annual Licence Fee = £150" added')],
  },
  {
    id: 'verr-turn3-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['fees'],
    applyPatch: withFeeRules([{ id: 'fee-annual-licence', condition: 'Annual Licence Fee', amount: 150 }]),
  },
  {
    id: 'verr-turn3-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['fees'],
  },
  {
    id: 'verr-turn3-completeness-engine',
    activeComponent: 'completeness-engine',
    timelineStage: 'definition',
    completeness: {
      metadata: 'complete',
      registry: 'complete',
      workflow: 'complete',
      roles: 'complete',
      fees: 'complete',
      notifications: 'missing',
      overall: 90,
    },
    message: {
      id: 'verr-msg-6',
      role: 'ai',
      text: 'What notifications should be sent?',
      suggestedReplies: ['SMS after Approved', 'Email after Approved', 'SMS on rejection', 'None'],
    },
    waitsForUser: true,
  },
  { id: 'verr-turn3-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Turn 4 — notification clarification (introduces the bug) ─────────────────────────
  {
    id: 'verr-turn4-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'verr-msg-7',
      role: 'administrator',
      text: 'SMS after Approved.',
    },
  },
  { id: 'verr-turn4-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'verr-turn4-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'verr-turn4-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'verr-turn4-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Approved', destination: 'Event' },
      { text: 'SMS', destination: 'Channel' },
      { text: 'Business Owner', destination: 'Recipient' },
    ],
  },
  {
    id: 'verr-turn4-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_NOTIFICATION', 'Create the approval SMS notification', 'notifications', 'Notification "Approved → SMS → Business Owner" added'),
    ],
  },
  {
    id: 'verr-turn4-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['notifications'],
    applyPatch: withNotificationRules([{ id: 'notify-approved-sms', event: 'Approved', channel: 'SMS', recipient: 'Business Owner' }]),
  },
  {
    id: 'verr-turn4-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['notifications'],
  },
  {
    id: 'verr-turn4-completeness-engine',
    activeComponent: 'completeness-engine',
    timelineStage: 'definition',
    completeness: {
      metadata: 'complete',
      registry: 'complete',
      workflow: 'complete',
      roles: 'complete',
      fees: 'complete',
      notifications: 'complete',
      overall: 100,
    },
    message: {
      id: 'verr-msg-8',
      role: 'system',
      text: 'Application Definition complete — ready for review.',
    },
  },
  { id: 'verr-turn4-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Review ─────────────────────────
  {
    id: 'verr-review',
    activeComponent: 'review',
    timelineStage: 'validation',
    message: {
      id: 'verr-msg-9',
      role: 'ai',
      text: 'Your Trade Licence application is complete. Please review the summary before confirming.',
    },
  },
]
