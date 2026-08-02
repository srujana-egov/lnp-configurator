import type { ArchitectureEdgeData, ArchitectureNodeData } from '@/types/architecture'

const NODE_WIDTH = 220
const NODE_GAP_Y = 100

export const ARCHITECTURE_NODES: ArchitectureNodeData[] = [
  {
    id: 'administrator',
    title: 'Administrator',
    description: 'Human administrator initiating authoring in natural language.',
    icon: 'User',
    x: 0,
    y: 0 * NODE_GAP_Y,
  },
  {
    id: 'conversation-interface',
    title: 'Conversation Interface',
    description: 'Captures administrator messages and displays AI replies.',
    icon: 'MessageSquare',
    x: 0,
    y: 1 * NODE_GAP_Y,
  },
  {
    id: 'conversation-manager',
    title: 'Conversation Manager',
    description: 'Maintains conversation history, context and clarification state.',
    icon: 'History',
    x: 0,
    y: 2 * NODE_GAP_Y,
  },
  {
    id: 'ai-orchestrator',
    title: 'AI Orchestrator',
    description: 'Coordinates AI reasoning without ever editing the model.',
    icon: 'Brain',
    x: 0,
    y: 3 * NODE_GAP_Y,
  },
  {
    id: 'understanding-engine',
    title: 'Application Understanding Engine',
    description: 'Transforms natural language into structured knowledge.',
    icon: 'Sparkles',
    x: 0,
    y: 4 * NODE_GAP_Y,
  },
  {
    id: 'structured-operations',
    title: 'Structured Operations',
    description: 'Converts extracted knowledge into deterministic, replayable operations.',
    icon: 'ListChecks',
    x: 0,
    y: 5 * NODE_GAP_Y,
  },
  {
    id: 'operation-executor',
    title: 'Operation Executor',
    description: 'The only component allowed to modify the Application Definition.',
    icon: 'Cog',
    x: 0,
    y: 6 * NODE_GAP_Y,
  },
  {
    id: 'application-definition',
    title: 'Application Definition',
    description: 'Canonical, single source of truth for the application.',
    icon: 'Database',
    x: 0,
    y: 7 * NODE_GAP_Y,
  },
  {
    id: 'completeness-engine',
    title: 'Completeness Engine',
    description: 'Determines whether sufficient information exists to proceed.',
    icon: 'CircleCheck',
    x: 0,
    y: 8 * NODE_GAP_Y,
  },
  {
    id: 'preview',
    title: 'Preview',
    description: 'Renders a live preview generated only from the Application Definition.',
    icon: 'Eye',
    x: 0,
    y: 9 * NODE_GAP_Y,
  },
  {
    id: 'review',
    title: 'Review & Confirmation',
    description: 'Human approval gate before deterministic compilation.',
    icon: 'ShieldCheck',
    x: 0,
    y: 10 * NODE_GAP_Y,
  },
]

export const PHASE_DIVIDER_Y = 11 * NODE_GAP_Y
const PHASE_2_START_Y = PHASE_DIVIDER_Y + NODE_GAP_Y

export const PHASE_2_NODES: ArchitectureNodeData[] = [
  {
    id: 'reference-resolver',
    title: 'Reference Resolver',
    description: 'Validates cross-references in the confirmed Application Definition before anything compiles.',
    icon: 'ListTree',
    x: 0,
    y: PHASE_2_START_Y,
  },
  {
    id: 'registry-compiler',
    title: 'Registry Compiler',
    description: 'Transforms the Registry section into registry.json.',
    icon: 'FileJson',
    x: 0,
    y: PHASE_2_START_Y + 1 * NODE_GAP_Y,
  },
  {
    id: 'workflow-compiler',
    title: 'Workflow Compiler',
    description: 'Transforms the Workflow section into workflow.json.',
    icon: 'Workflow',
    x: 0,
    y: PHASE_2_START_Y + 2 * NODE_GAP_Y,
  },
  {
    id: 'fee-compiler',
    title: 'Fee Compiler',
    description: 'Transforms fee rules into calculation.json.',
    icon: 'Receipt',
    x: 0,
    y: PHASE_2_START_Y + 3 * NODE_GAP_Y,
  },
  {
    id: 'notification-compiler',
    title: 'Notification Compiler',
    description: 'Transforms notification rules into notification.json.',
    icon: 'BellRing',
    x: 0,
    y: PHASE_2_START_Y + 4 * NODE_GAP_Y,
  },
  {
    id: 'generated-files',
    title: 'Generated Configuration Files',
    description: 'Final deployment-ready DIGIT configuration artifacts.',
    icon: 'PackageCheck',
    x: 0,
    y: PHASE_2_START_Y + 5 * NODE_GAP_Y,
  },
]

export const ARCHITECTURE_EDGES: ArchitectureEdgeData[] = [
  { id: 'e-admin-ci', source: 'administrator', target: 'conversation-interface' },
  { id: 'e-ci-cm', source: 'conversation-interface', target: 'conversation-manager' },
  { id: 'e-cm-orch', source: 'conversation-manager', target: 'ai-orchestrator' },
  { id: 'e-orch-ue', source: 'ai-orchestrator', target: 'understanding-engine' },
  { id: 'e-ue-so', source: 'understanding-engine', target: 'structured-operations' },
  { id: 'e-so-oe', source: 'structured-operations', target: 'operation-executor' },
  { id: 'e-oe-ad', source: 'operation-executor', target: 'application-definition' },
  { id: 'e-ad-ce', source: 'application-definition', target: 'completeness-engine' },
  { id: 'e-ce-pv', source: 'completeness-engine', target: 'preview' },
  { id: 'e-pv-review', source: 'preview', target: 'review' },
  { id: 'e-pv-loop-cm', source: 'preview', target: 'conversation-manager', loop: true },
  { id: 'e-review-rr', source: 'review', target: 'reference-resolver' },
  { id: 'e-rr-regc', source: 'reference-resolver', target: 'registry-compiler' },
  { id: 'e-regc-wfc', source: 'registry-compiler', target: 'workflow-compiler' },
  { id: 'e-wfc-feec', source: 'workflow-compiler', target: 'fee-compiler' },
  { id: 'e-feec-notc', source: 'fee-compiler', target: 'notification-compiler' },
  { id: 'e-notc-gen', source: 'notification-compiler', target: 'generated-files' },
]

/**
 * Illustrative only — never animated. Reinforces that every compiler reads the same
 * canonical Application Definition independently, even though the demo runs them in
 * sequence for clarity (see 05_Phase2_Compilation.md, "Parallel Compilation").
 */
export const PARALLEL_REFERENCE_EDGES: ArchitectureEdgeData[] = [
  { id: 'e-ad-regc-ref', source: 'application-definition', target: 'registry-compiler' },
  { id: 'e-ad-wfc-ref', source: 'application-definition', target: 'workflow-compiler' },
  { id: 'e-ad-feec-ref', source: 'application-definition', target: 'fee-compiler' },
  { id: 'e-ad-notc-ref', source: 'application-definition', target: 'notification-compiler' },
]

export const NODE_WIDTH_PX = NODE_WIDTH
