import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'

export function ParallelReferenceEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <BaseEdge
      path={path}
      style={{
        stroke: 'var(--color-border)',
        strokeWidth: 1,
        strokeDasharray: '2 4',
        opacity: 0.6,
      }}
    />
  )
}
