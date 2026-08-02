import { BaseEdge, getBezierPath, getSmoothStepPath, type Edge, type EdgeProps } from '@xyflow/react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export type EdgeRunStatus = 'inactive' | 'active' | 'completed'

export interface ArchitectureEdgeRenderData extends Record<string, unknown> {
  status: EdgeRunStatus
  speed?: number
  paused?: boolean
  smooth?: boolean
}

export type ArchitectureFlowEdge = Edge<ArchitectureEdgeRenderData, 'architectureEdge'>

export function ArchitectureEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<ArchitectureFlowEdge>) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const status = data?.status ?? 'inactive'
  const speed = data?.speed ?? 1
  const animated = status === 'active' && !prefersReducedMotion && !data?.paused

  const [path] = data?.smooth
    ? getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12 })
    : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  const stroke = status === 'active' ? 'var(--color-primary)' : status === 'completed' ? 'var(--color-success)' : 'var(--color-border)'

  return (
    <BaseEdge
      path={path}
      style={{
        stroke,
        strokeWidth: status === 'active' ? 2.5 : 1.5,
        strokeDasharray: status === 'active' ? '6 6' : undefined,
        animation: animated ? `edge-flow ${0.6 / speed}s linear infinite` : undefined,
        transition: 'stroke 0.3s ease-out, stroke-width 0.3s ease-out',
      }}
    />
  )
}
