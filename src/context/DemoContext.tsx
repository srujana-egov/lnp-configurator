import { createContext, useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { SCENARIOS, DEFAULT_SCENARIO_ID } from '@/data/scenarios'
import { ARCHITECTURE_EDGES } from '@/data/architectureNodes'
import { EMPTY_APPLICATION_DEFINITION, type ApplicationDefinition } from '@/types/applicationDefinition'
import { EMPTY_COMPLETENESS, type CompletenessSnapshot } from '@/types/completeness'
import type { ArchitectureComponentId, ComponentRunStatus } from '@/types/architecture'
import type { ConversationMessage, ScenarioBeat, ScenarioId, TimelineStageId } from '@/types/scenario'

export const STAGE_ORDER: TimelineStageId[] = [
  'conversation',
  'understanding',
  'operations',
  'definition',
  'validation',
  'compilation',
  'deployment',
]

export type PlaybackSpeed = 0.5 | 1 | 2 | 5
export type DefinitionViewMode = 'tree' | 'json'
export type RightPanelViewMode = 'definition' | 'preview'

interface DemoState {
  beatIndex: number
  isPlaying: boolean
  speed: PlaybackSpeed
  selectedComponentId: ArchitectureComponentId | null
  viewMode: RightPanelViewMode
  definitionViewMode: DefinitionViewMode
}

type DemoAction =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'JUMP_TO'; index: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESTART' }
  | { type: 'SET_SPEED'; speed: PlaybackSpeed }
  | { type: 'SELECT_COMPONENT'; id: ArchitectureComponentId | null }
  | { type: 'SET_VIEW_MODE'; mode: RightPanelViewMode }
  | { type: 'SET_DEFINITION_VIEW_MODE'; mode: DefinitionViewMode }

const initialState: DemoState = {
  beatIndex: -1,
  isPlaying: false,
  speed: 1,
  selectedComponentId: null,
  viewMode: 'definition',
  definitionViewMode: 'tree',
}

function clampIndex(index: number, lastIndex: number) {
  return Math.max(-1, Math.min(lastIndex, index))
}

function createReducer(lastIndex: number) {
  return function reducer(state: DemoState, action: DemoAction): DemoState {
    switch (action.type) {
      case 'NEXT': {
        const next = clampIndex(state.beatIndex + 1, lastIndex)
        return { ...state, beatIndex: next, isPlaying: next < lastIndex && state.isPlaying }
      }
      case 'PREVIOUS':
        return { ...state, beatIndex: clampIndex(state.beatIndex - 1, lastIndex), isPlaying: false }
      case 'JUMP_TO':
        return { ...state, beatIndex: clampIndex(action.index, lastIndex), isPlaying: false }
      case 'PLAY':
        return { ...state, isPlaying: state.beatIndex < lastIndex }
      case 'PAUSE':
        return { ...state, isPlaying: false }
      case 'RESTART':
        return { ...state, beatIndex: -1, isPlaying: false, selectedComponentId: null }
      case 'SET_SPEED':
        return { ...state, speed: action.speed }
      case 'SELECT_COMPONENT':
        return { ...state, selectedComponentId: action.id }
      case 'SET_VIEW_MODE':
        return { ...state, viewMode: action.mode }
      case 'SET_DEFINITION_VIEW_MODE':
        return { ...state, definitionViewMode: action.mode }
      default:
        return state
    }
  }
}

function foldDefinition(beats: ScenarioBeat[]): ApplicationDefinition {
  return beats.reduce(
    (def, beat) => (beat.applyPatch ? beat.applyPatch(def) : def),
    EMPTY_APPLICATION_DEFINITION,
  )
}

function foldCompleteness(beats: ScenarioBeat[]): CompletenessSnapshot {
  for (let i = beats.length - 1; i >= 0; i -= 1) {
    if (beats[i].completeness) return beats[i].completeness as CompletenessSnapshot
  }
  return EMPTY_COMPLETENESS
}

export interface DemoContextValue {
  beatIndex: number
  currentBeat: ScenarioBeat | null
  isPlaying: boolean
  speed: PlaybackSpeed
  selectedComponentId: ArchitectureComponentId | null
  viewMode: RightPanelViewMode
  definitionViewMode: DefinitionViewMode
  applicationDefinition: ApplicationDefinition
  completeness: CompletenessSnapshot
  messages: ConversationMessage[]
  highlightPaths: string[]
  timelineStage: TimelineStageId
  reachedStages: Set<TimelineStageId>
  activeEdgeId: string | null
  traversedEdgeIds: Set<string>
  canGoNext: boolean
  canGoPrevious: boolean
  isFinished: boolean
  totalBeats: number
  getComponentStatus: (id: ArchitectureComponentId) => ComponentRunStatus
  next: () => void
  previous: () => void
  jumpToBeat: (index: number) => void
  jumpToStage: (stage: TimelineStageId) => void
  play: () => void
  pause: () => void
  restart: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  selectComponent: (id: ArchitectureComponentId | null) => void
  setViewMode: (mode: RightPanelViewMode) => void
  setDefinitionViewMode: (mode: DefinitionViewMode) => void
}

export const DemoContext = createContext<DemoContextValue | undefined>(undefined)

export function DemoProvider({
  scenarioId = DEFAULT_SCENARIO_ID,
  children,
}: {
  scenarioId?: ScenarioId
  children: ReactNode
}) {
  const beats = useMemo(() => SCENARIOS[scenarioId].beats, [scenarioId])
  const lastIndex = beats.length - 1
  const reducer = useMemo(() => createReducer(lastIndex), [lastIndex])
  const [state, dispatch] = useReducer(reducer, initialState)

  const activeBeats = useMemo(() => beats.slice(0, state.beatIndex + 1), [beats, state.beatIndex])
  const currentBeat = state.beatIndex >= 0 ? beats[state.beatIndex] : null
  const previousBeat = state.beatIndex > 0 ? beats[state.beatIndex - 1] : null

  const applicationDefinition = useMemo(() => foldDefinition(activeBeats), [activeBeats])
  const completeness = useMemo(() => foldCompleteness(activeBeats), [activeBeats])
  const messages = useMemo(
    () => activeBeats.map((b) => b.message).filter((m): m is ConversationMessage => Boolean(m)),
    [activeBeats],
  )

  const reachedStages = useMemo(() => {
    const set = new Set<TimelineStageId>()
    activeBeats.forEach((b) => set.add(b.timelineStage))
    return set
  }, [activeBeats])

  const timelineStage = useMemo<TimelineStageId>(() => {
    let furthest: TimelineStageId = 'conversation'
    let furthestRank = -1
    reachedStages.forEach((stage) => {
      const rank = STAGE_ORDER.indexOf(stage)
      if (rank > furthestRank) {
        furthestRank = rank
        furthest = stage
      }
    })
    return furthest
  }, [reachedStages])

  const activeEdgeId = useMemo(() => {
    if (!currentBeat || !previousBeat) return null
    const edge = ARCHITECTURE_EDGES.find(
      (e) => e.source === previousBeat.activeComponent && e.target === currentBeat.activeComponent,
    )
    return edge?.id ?? null
  }, [currentBeat, previousBeat])

  const traversedEdgeIds = useMemo(() => {
    const set = new Set<string>()
    for (let i = 1; i < activeBeats.length; i += 1) {
      const edge = ARCHITECTURE_EDGES.find(
        (e) => e.source === activeBeats[i - 1].activeComponent && e.target === activeBeats[i].activeComponent,
      )
      if (edge) set.add(edge.id)
    }
    return set
  }, [activeBeats])

  const getComponentStatus = useCallback(
    (id: ArchitectureComponentId): ComponentRunStatus => {
      if (currentBeat?.activeComponent === id) return 'running'
      const everActivated = activeBeats.some((b) => b.activeComponent === id)
      return everActivated ? 'completed' : 'inactive'
    },
    [activeBeats, currentBeat],
  )

  const canGoNext = state.beatIndex < lastIndex
  const canGoPrevious = state.beatIndex > -1
  const isFinished = state.beatIndex >= lastIndex

  // Autoplay engine
  useEffect(() => {
    if (!state.isPlaying) return
    if (state.beatIndex >= lastIndex) return

    const beat = state.beatIndex >= 0 ? beats[state.beatIndex] : null
    const baseDelay = beat?.waitsForUser ? 2200 : beat?.message ? 1600 : 1000
    const delay = baseDelay / state.speed

    const timeout = setTimeout(() => dispatch({ type: 'NEXT' }), delay)
    return () => clearTimeout(timeout)
  }, [state.isPlaying, state.beatIndex, state.speed, beats, lastIndex])

  const jumpToStage = useCallback(
    (stage: TimelineStageId) => {
      if (!reachedStages.has(stage)) return
      let target = -1
      for (let index = 0; index <= state.beatIndex; index += 1) {
        if (beats[index].timelineStage === stage) target = index
      }
      if (target !== -1) dispatch({ type: 'JUMP_TO', index: target })
    },
    [state.beatIndex, reachedStages, beats],
  )

  const value: DemoContextValue = {
    beatIndex: state.beatIndex,
    currentBeat,
    isPlaying: state.isPlaying,
    speed: state.speed,
    selectedComponentId: state.selectedComponentId,
    viewMode: state.viewMode,
    definitionViewMode: state.definitionViewMode,
    applicationDefinition,
    completeness,
    messages,
    highlightPaths: currentBeat?.highlightPaths ?? [],
    timelineStage,
    reachedStages,
    activeEdgeId,
    traversedEdgeIds,
    canGoNext,
    canGoPrevious,
    isFinished,
    totalBeats: beats.length,
    getComponentStatus,
    next: () => dispatch({ type: 'NEXT' }),
    previous: () => dispatch({ type: 'PREVIOUS' }),
    jumpToBeat: (index) => dispatch({ type: 'JUMP_TO', index }),
    jumpToStage,
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    restart: () => dispatch({ type: 'RESTART' }),
    setSpeed: (speed) => dispatch({ type: 'SET_SPEED', speed }),
    selectComponent: (id) => dispatch({ type: 'SELECT_COMPONENT', id }),
    setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', mode }),
    setDefinitionViewMode: (mode) => dispatch({ type: 'SET_DEFINITION_VIEW_MODE', mode }),
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
