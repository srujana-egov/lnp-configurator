import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { compileFees, compileNotifications, compileRegistry, compileWorkflow, isValidationSuccessful, validateApplicationDefinition } from '@/lib/compilers'
import { useDemo } from '@/hooks/useDemo'
import type { ArchitectureComponentId, ComponentRunStatus } from '@/types/architecture'
import type { CompilationStatus, GeneratedFile, GeneratedFileId, TraceEntry, ValidationCheck } from '@/types/compilation'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour12: false })
}

interface CompilationState {
  status: CompilationStatus
  checks: ValidationCheck[]
  visibleCheckCount: number
  currentComponentId: ArchitectureComponentId | null
  completedComponentIds: ArchitectureComponentId[]
  trace: TraceEntry[]
  files: Partial<Record<GeneratedFileId, GeneratedFile>>
}

type CompilationAction =
  | { type: 'RESET' }
  | { type: 'SET_STATUS'; status: CompilationStatus }
  | { type: 'SET_CHECKS'; checks: ValidationCheck[] }
  | { type: 'REVEAL_NEXT_CHECK' }
  | { type: 'SET_CURRENT_COMPONENT'; id: ArchitectureComponentId | null }
  | { type: 'COMPLETE_COMPONENT'; id: ArchitectureComponentId }
  | { type: 'ADD_FILE'; file: GeneratedFile }
  | { type: 'ADD_TRACE'; entry: TraceEntry }

const initialState: CompilationState = {
  status: 'idle',
  checks: [],
  visibleCheckCount: 0,
  currentComponentId: null,
  completedComponentIds: [],
  trace: [],
  files: {},
}

function reducer(state: CompilationState, action: CompilationAction): CompilationState {
  switch (action.type) {
    case 'RESET':
      return initialState
    case 'SET_STATUS':
      return { ...state, status: action.status }
    case 'SET_CHECKS':
      return { ...state, checks: action.checks, visibleCheckCount: 0 }
    case 'REVEAL_NEXT_CHECK':
      return { ...state, visibleCheckCount: Math.min(state.checks.length, state.visibleCheckCount + 1) }
    case 'SET_CURRENT_COMPONENT':
      return { ...state, currentComponentId: action.id }
    case 'COMPLETE_COMPONENT':
      return {
        ...state,
        completedComponentIds: state.completedComponentIds.includes(action.id)
          ? state.completedComponentIds
          : [...state.completedComponentIds, action.id],
      }
    case 'ADD_FILE':
      return { ...state, files: { ...state.files, [action.file.id]: action.file } }
    case 'ADD_TRACE':
      return { ...state, trace: [...state.trace, action.entry] }
    default:
      return state
  }
}

export interface CompilationContextValue {
  status: CompilationStatus
  checks: ValidationCheck[]
  visibleChecks: ValidationCheck[]
  currentComponentId: ArchitectureComponentId | null
  trace: TraceEntry[]
  files: Partial<Record<GeneratedFileId, GeneratedFile>>
  isRunning: boolean
  getComponentStatus: (id: ArchitectureComponentId) => ComponentRunStatus
  start: () => void
  returnToReview: () => void
}

export const CompilationContext = createContext<CompilationContextValue | undefined>(undefined)

const COMPILE_STAGES: { componentId: ArchitectureComponentId; fileId: GeneratedFileId; filename: string; traceMessage: string }[] = [
  { componentId: 'registry-compiler', fileId: 'registry', filename: 'registry.json', traceMessage: 'Registry configuration generated.' },
  { componentId: 'workflow-compiler', fileId: 'workflow', filename: 'workflow.json', traceMessage: 'Workflow configuration generated.' },
  { componentId: 'fee-compiler', fileId: 'calculation', filename: 'calculation.json', traceMessage: 'Fee configuration generated.' },
  { componentId: 'notification-compiler', fileId: 'notification', filename: 'notification.json', traceMessage: 'Notification configuration generated.' },
]

export function CompilationProvider({ children }: { children: ReactNode }) {
  const { applicationDefinition, speed } = useDemo()
  const [state, dispatch] = useReducer(reducer, initialState)
  const cancelledRef = useRef(false)

  useEffect(() => () => {
    cancelledRef.current = true
  }, [])

  const addTrace = useCallback((message: string) => {
    dispatch({ type: 'ADD_TRACE', entry: { id: `trace-${Date.now()}-${message}`, time: formatTime(new Date()), message } })
  }, [])

  const start = useCallback(() => {
    cancelledRef.current = false
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_STATUS', status: 'validating' })
    dispatch({ type: 'SET_CURRENT_COMPONENT', id: 'reference-resolver' })
    addTrace('Compilation started.')

    const checks = validateApplicationDefinition(applicationDefinition)
    dispatch({ type: 'SET_CHECKS', checks })

    const at = (ms: number) => sleep(ms / speed)

    void (async () => {
      for (let i = 0; i < checks.length; i += 1) {
        await at(500)
        if (cancelledRef.current) return
        dispatch({ type: 'REVEAL_NEXT_CHECK' })
      }

      await at(400)
      if (cancelledRef.current) return

      if (!isValidationSuccessful(checks)) {
        addTrace('Reference validation failed. Compilation aborted.')
        dispatch({ type: 'SET_STATUS', status: 'failed' })
        return
      }

      addTrace('Reference validation complete.')
      dispatch({ type: 'COMPLETE_COMPONENT', id: 'reference-resolver' })
      dispatch({ type: 'SET_STATUS', status: 'compiling' })

      const compilers: Record<GeneratedFileId, () => unknown> = {
        registry: () => compileRegistry(applicationDefinition),
        workflow: () => compileWorkflow(applicationDefinition),
        calculation: () => compileFees(applicationDefinition),
        notification: () => compileNotifications(applicationDefinition),
      }

      for (const stage of COMPILE_STAGES) {
        dispatch({ type: 'SET_CURRENT_COMPONENT', id: stage.componentId })
        await at(900)
        if (cancelledRef.current) return

        dispatch({
          type: 'ADD_FILE',
          file: { id: stage.fileId, filename: stage.filename, json: compilers[stage.fileId](), generatedAt: Date.now() },
        })
        dispatch({ type: 'COMPLETE_COMPONENT', id: stage.componentId })
        addTrace(stage.traceMessage)
      }

      dispatch({ type: 'SET_CURRENT_COMPONENT', id: 'generated-files' })
      await at(500)
      if (cancelledRef.current) return
      dispatch({ type: 'COMPLETE_COMPONENT', id: 'generated-files' })
      addTrace('Compilation complete.')
      dispatch({ type: 'SET_STATUS', status: 'complete' })
    })()
  }, [applicationDefinition, addTrace, speed])

  const returnToReview = useCallback(() => {
    cancelledRef.current = true
    dispatch({ type: 'RESET' })
  }, [])

  const getComponentStatus = useCallback(
    (id: ArchitectureComponentId): ComponentRunStatus => {
      if (state.status === 'failed' && id === 'reference-resolver') return 'failed'
      if (state.currentComponentId === id) return 'running'
      if (state.completedComponentIds.includes(id)) return 'completed'
      return 'inactive'
    },
    [state.status, state.currentComponentId, state.completedComponentIds],
  )

  const visibleChecks = useMemo(() => state.checks.slice(0, state.visibleCheckCount), [state.checks, state.visibleCheckCount])

  const value: CompilationContextValue = {
    status: state.status,
    checks: state.checks,
    visibleChecks,
    currentComponentId: state.currentComponentId,
    trace: state.trace,
    files: state.files,
    isRunning: state.status !== 'idle',
    getComponentStatus,
    start,
    returnToReview,
  }

  return <CompilationContext.Provider value={value}>{children}</CompilationContext.Provider>
}
