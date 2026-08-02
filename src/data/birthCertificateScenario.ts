import type { ApplicationDefinition } from '@/types/applicationDefinition'
import type { ScenarioBeat } from '@/types/scenario'

let opCounter = 0
function op(type: string, description: string, target: string, result: string) {
  opCounter += 1
  return { id: `op-${opCounter}`, type, description, target, result }
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

export const BIRTH_CERTIFICATE_SCENARIO: ScenarioBeat[] = [
  // ───────────────────────── Turn 1 — initial prompt ─────────────────────────
  {
    id: 'turn1-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'msg-1',
      role: 'administrator',
      text: 'Create a Birth Certificate application where citizens apply online. A registrar verifies applications before approval.',
    },
  },
  {
    id: 'turn1-conversation-interface',
    activeComponent: 'conversation-interface',
    timelineStage: 'conversation',
  },
  {
    id: 'turn1-conversation-manager',
    activeComponent: 'conversation-manager',
    timelineStage: 'conversation',
  },
  {
    id: 'turn1-ai-orchestrator',
    activeComponent: 'ai-orchestrator',
    timelineStage: 'conversation',
  },
  {
    id: 'turn1-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Create', destination: 'Application' },
      { text: 'Birth Certificate', destination: 'Metadata' },
      { text: 'Citizens', destination: 'Applicant' },
      { text: 'Registrar', destination: 'Role' },
      { text: 'Approval', destination: 'Workflow' },
    ],
  },
  {
    id: 'turn1-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_APPLICATION', 'Create the Birth Certificate application', 'metadata', 'Application "Birth Certificate" created'),
      op('CREATE_ROLE', 'Create the Citizen role', 'roles', 'Role "Citizen" added'),
      op('CREATE_ROLE', 'Create the Registrar role', 'roles', 'Role "Registrar" added'),
      op('CREATE_WORKFLOW', 'Create the approval workflow', 'workflow', 'States Submission → Verification → Approval created'),
      op('CREATE_FEE_POLICY', 'Create an empty fee policy placeholder', 'fees', 'Fee policy placeholder created'),
    ],
  },
  {
    id: 'turn1-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['metadata', 'roles', 'workflow', 'fees'],
    applyPatch: (def) =>
      [
        withMetadata({ name: 'Birth Certificate', department: 'Birth Registration', applicantType: 'Citizen', version: '1.0' }),
        withRoles(['Citizen', 'Registrar']),
        withWorkflow(
          [
            { id: 'submission', label: 'Submission' },
            { id: 'verification', label: 'Verification', assignedRole: 'Registrar' },
            { id: 'approval', label: 'Approval', assignedRole: 'Registrar' },
          ],
          [
            { from: 'submission', to: 'verification' },
            { from: 'verification', to: 'approval' },
          ],
        ),
      ].reduce((acc, fn) => fn(acc), def),
  },
  {
    id: 'turn1-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['metadata', 'roles', 'workflow', 'fees'],
  },
  {
    id: 'turn1-completeness-engine',
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
      id: 'msg-2',
      role: 'ai',
      text: 'What information should citizens provide when applying?',
      suggestedReplies: ['Child Name', 'Date of Birth', 'Gender', 'Hospital Details', 'Parents Information'],
    },
    waitsForUser: true,
  },
  {
    id: 'turn1-preview',
    activeComponent: 'preview',
    timelineStage: 'definition',
  },

  // ───────────────────────── Turn 2 — registry clarification ─────────────────────────
  {
    id: 'turn2-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'msg-3',
      role: 'administrator',
      text: 'Child Name, Date of Birth, Gender, Hospital Name if born in hospital.',
    },
  },
  { id: 'turn2-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'turn2-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'turn2-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'turn2-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Child Name', destination: 'Registry Field' },
      { text: 'Date of Birth', destination: 'Registry Field' },
      { text: 'Gender', destination: 'Registry Field' },
      { text: 'Hospital Name', destination: 'Conditional Field' },
    ],
  },
  {
    id: 'turn2-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_SECTION', 'Create the Citizen Details section', 'registry', 'Section "Citizen Details" created'),
      op('ADD_FIELD', 'Add the Child Name field', 'registry', 'Field "Child Name" added'),
      op('ADD_FIELD', 'Add the Date of Birth field', 'registry', 'Field "Date of Birth" added'),
      op('ADD_FIELD', 'Add the Gender field', 'registry', 'Field "Gender" added'),
      op('CREATE_CONDITIONAL_SECTION', 'Create the conditional Hospital Details section', 'registry', 'Section "Hospital Details" created (visible when born in hospital)'),
    ],
  },
  {
    id: 'turn2-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['registry'],
    applyPatch: withRegistrySections([
      {
        id: 'citizen-details',
        title: 'Citizen Details',
        fields: [
          { id: 'child_name', label: 'Child Name', type: 'text', required: true },
          { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
          { id: 'gender', label: 'Gender', type: 'dropdown', required: true },
        ],
      },
      {
        id: 'hospital-details',
        title: 'Hospital Details',
        conditional: true,
        fields: [{ id: 'hospital_name', label: 'Hospital Name', type: 'text', visibleWhen: { bornInHospital: true } }],
      },
    ]),
  },
  {
    id: 'turn2-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['registry'],
  },
  {
    id: 'turn2-completeness-engine',
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
      id: 'msg-4',
      role: 'ai',
      text: 'How should late registration fees be calculated?',
      suggestedReplies: ['Free within 30 days', '£100 after 30 days', 'No Fees', 'Custom Rule'],
    },
    waitsForUser: true,
  },
  { id: 'turn2-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Turn 3 — fee clarification ─────────────────────────
  {
    id: 'turn3-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'msg-5',
      role: 'administrator',
      text: 'Free within 30 days, £100 after 30 days.',
    },
  },
  { id: 'turn3-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'turn3-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'turn3-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'turn3-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Free within 30 days', destination: 'Fee Rule' },
      { text: '£100 after 30 days', destination: 'Fee Rule' },
    ],
  },
  {
    id: 'turn3-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_FEE_RULE', 'Create the within-30-days fee rule', 'fees', 'Fee rule "Within 30 Days = £0" added'),
      op('CREATE_FEE_RULE', 'Create the after-30-days fee rule', 'fees', 'Fee rule "After 30 Days = £100" added'),
    ],
  },
  {
    id: 'turn3-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['fees'],
    applyPatch: withFeeRules([
      { id: 'fee-within-30', condition: 'Within 30 Days', amount: 0 },
      { id: 'fee-after-30', condition: 'After 30 Days', amount: 100 },
    ]),
  },
  {
    id: 'turn3-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['fees'],
  },
  {
    id: 'turn3-completeness-engine',
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
      id: 'msg-6',
      role: 'ai',
      text: 'What notifications should be sent?',
      suggestedReplies: ['SMS after approval', 'Email after approval', 'SMS on rejection', 'None'],
    },
    waitsForUser: true,
  },
  { id: 'turn3-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Turn 4 — notification clarification ─────────────────────────
  {
    id: 'turn4-administrator',
    activeComponent: 'administrator',
    timelineStage: 'conversation',
    message: {
      id: 'msg-7',
      role: 'administrator',
      text: 'SMS after approval.',
    },
  },
  { id: 'turn4-conversation-interface', activeComponent: 'conversation-interface', timelineStage: 'conversation' },
  { id: 'turn4-conversation-manager', activeComponent: 'conversation-manager', timelineStage: 'conversation' },
  { id: 'turn4-ai-orchestrator', activeComponent: 'ai-orchestrator', timelineStage: 'conversation' },
  {
    id: 'turn4-understanding-engine',
    activeComponent: 'understanding-engine',
    timelineStage: 'understanding',
    extracted: [
      { text: 'Approval', destination: 'Event' },
      { text: 'SMS', destination: 'Channel' },
      { text: 'Citizen', destination: 'Recipient' },
    ],
  },
  {
    id: 'turn4-structured-operations',
    activeComponent: 'structured-operations',
    timelineStage: 'operations',
    operations: [
      op('CREATE_NOTIFICATION', 'Create the approval SMS notification', 'notifications', 'Notification "Approval → SMS → Citizen" added'),
    ],
  },
  {
    id: 'turn4-operation-executor',
    activeComponent: 'operation-executor',
    timelineStage: 'operations',
    highlightPaths: ['notifications'],
    applyPatch: withNotificationRules([{ id: 'notify-approval-sms', event: 'Approval', channel: 'SMS', recipient: 'Citizen' }]),
  },
  {
    id: 'turn4-application-definition',
    activeComponent: 'application-definition',
    timelineStage: 'definition',
    highlightPaths: ['notifications'],
  },
  {
    id: 'turn4-completeness-engine',
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
      id: 'msg-8',
      role: 'system',
      text: 'Application Definition complete — ready for review.',
    },
  },
  { id: 'turn4-preview', activeComponent: 'preview', timelineStage: 'definition' },

  // ───────────────────────── Review ─────────────────────────
  {
    id: 'review',
    activeComponent: 'review',
    timelineStage: 'validation',
    message: {
      id: 'msg-9',
      role: 'ai',
      text: 'Your Birth Certificate application is complete. Please review the summary before confirming.',
    },
  },
]
