import { useCallback, useMemo, type KeyboardEvent } from 'react'
import { ReactFlow, Background, Controls, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ARCHITECTURE_EDGES,
  ARCHITECTURE_NODES,
  PARALLEL_REFERENCE_EDGES,
  PHASE_2_NODES,
  PHASE_DIVIDER_Y,
} from '@/data/architectureNodes'
import { useDemo } from '@/hooks/useDemo'
import { useCompilation } from '@/hooks/useCompilation'
import { ArchitectureNode, STATUS_LABEL } from './ArchitectureNode'
import { ArchitectureEdge, type EdgeRunStatus } from './ArchitectureEdge'
import { ParallelReferenceEdge } from './ParallelReferenceEdge'
import { PhaseDivider } from './PhaseDivider'
import { ResearchDrawer } from '@/components/drawer/ResearchDrawer'
import { PHASE_1_COMPONENT_IDS, type ArchitectureComponentId } from '@/types/architecture'

const nodeTypes = { architectureNode: ArchitectureNode, phaseDivider: PhaseDivider }
const edgeTypes = { architectureEdge: ArchitectureEdge, parallelReferenceEdge: ParallelReferenceEdge }

const PHASE_1_ID_SET = new Set(PHASE_1_COMPONENT_IDS)

export function ArchitectureCanvas({ captureMode = false }: { captureMode?: boolean }) {
  const { selectedComponentId, selectComponent, speed, activeEdgeId, traversedEdgeIds, getComponentStatus: demoGetComponentStatus } =
    useDemo()
  const { isRunning, getComponentStatus: compilationGetComponentStatus } = useCompilation()

  const getStatus = useCallback(
    (id: ArchitectureComponentId) => (PHASE_1_ID_SET.has(id) ? demoGetComponentStatus(id) : compilationGetComponentStatus(id)),
    [demoGetComponentStatus, compilationGetComponentStatus],
  )

  const nodes = useMemo<Node[]>(() => {
    const phase1Nodes = ARCHITECTURE_NODES.map((n) => ({
      id: n.id,
      type: 'architectureNode' as const,
      position: { x: n.x, y: n.y },
      draggable: false,
      selectable: true,
      ariaLabel: `${n.title}, ${STATUS_LABEL[getStatus(n.id)]}. Press Enter to open research details.`,
      data: {
        title: n.title,
        description: n.description,
        icon: n.icon,
        status: getStatus(n.id),
        isSelected: selectedComponentId === n.id,
        dimmed: isRunning,
        speed,
        paused: captureMode,
      },
    }))

    const dividerNode = {
      id: 'phase-divider',
      type: 'phaseDivider' as const,
      position: { x: 0, y: PHASE_DIVIDER_Y },
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        title: '',
        description: '',
        icon: '',
        status: 'inactive' as const,
        isSelected: false,
      },
    }

    const phase2Nodes = PHASE_2_NODES.map((n) => ({
      id: n.id,
      type: 'architectureNode' as const,
      position: { x: n.x, y: n.y },
      draggable: false,
      selectable: true,
      ariaLabel: `${n.title}, ${STATUS_LABEL[getStatus(n.id)]}. Press Enter to open research details.`,
      data: {
        title: n.title,
        description: n.description,
        icon: n.icon,
        status: getStatus(n.id),
        isSelected: selectedComponentId === n.id,
        speed,
        paused: captureMode,
      },
    }))

    return [...phase1Nodes, dividerNode, ...phase2Nodes]
  }, [getStatus, selectedComponentId, isRunning, speed, captureMode])

  const edges = useMemo<Edge[]>(() => {
    const mainEdges = ARCHITECTURE_EDGES.map((e) => {
      const sourceIsPhase1 = PHASE_1_ID_SET.has(e.source)
      const targetIsPhase1 = PHASE_1_ID_SET.has(e.target)

      let status: EdgeRunStatus
      if (sourceIsPhase1 && targetIsPhase1) {
        status = e.id === activeEdgeId ? 'active' : traversedEdgeIds.has(e.id) ? 'completed' : 'inactive'
      } else {
        const sourceStatus = sourceIsPhase1 ? (isRunning ? 'completed' : 'inactive') : compilationGetComponentStatus(e.source)
        const targetStatus = compilationGetComponentStatus(e.target)
        if (targetStatus === 'completed') status = 'completed'
        else if ((targetStatus === 'running' || targetStatus === 'failed') && sourceStatus === 'completed') status = 'active'
        else status = 'inactive'
      }

      const isLongRoute = Boolean(e.loop) || !(sourceIsPhase1 && targetIsPhase1)

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.loop ? 'right-source' : 'bottom',
        targetHandle: e.loop ? 'right-target' : 'top',
        type: 'architectureEdge' as const,
        data: { status, speed, paused: captureMode, smooth: isLongRoute },
      }
    })

    const parallelEdges = PARALLEL_REFERENCE_EDGES.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: 'right-source',
      targetHandle: 'right-target',
      type: 'parallelReferenceEdge' as const,
    }))

    return [...mainEdges, ...parallelEdges]
  }, [activeEdgeId, traversedEdgeIds, compilationGetComponentStatus, isRunning, speed, captureMode])

  // React Flow's own Enter/Space/Escape handling only toggles its internal selection
  // state — it never calls onNodeClick and it stops the event from reaching a window
  // listener. Catch the (bubbled) keydown here so it also drives our own drawer state.
  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      selectComponent(null)
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    const target = event.target as HTMLElement
    const nodeId = target.closest('[data-id]')?.getAttribute('data-id')
    if (!nodeId || nodeId === 'phase-divider') return
    event.preventDefault()
    selectComponent(nodeId as ArchitectureComponentId)
  }

  return (
    <section
      className={`relative flex flex-col rounded-xl border border-border bg-card p-6 ${
        captureMode ? 'h-full w-full' : 'w-[45%]'
      }`}
    >
      {!captureMode && <h2 className="text-lg font-semibold text-foreground">Architecture</h2>}
      <div
        className={`flex-1 overflow-hidden rounded-lg border border-dashed border-border ${captureMode ? '' : 'mt-4'}`}
        onKeyDown={handleCanvasKeyDown}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_event, node) => {
            if (node.type === 'phaseDivider') return
            selectComponent(node.id as ArchitectureComponentId)
          }}
          onPaneClick={() => selectComponent(null)}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.25}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={!captureMode}
          panOnScroll
        >
          <Background gap={24} size={1} />
          {!captureMode && <Controls showInteractive={false} />}
        </ReactFlow>
      </div>
      {!captureMode && <ResearchDrawer componentId={selectedComponentId} onClose={() => selectComponent(null)} />}
    </section>
  )
}
