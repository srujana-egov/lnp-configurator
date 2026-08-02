import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import {
  BellRing,
  Brain,
  CircleCheck,
  Cog,
  Database,
  Eye,
  FileJson,
  History,
  ListChecks,
  ListTree,
  MessageSquare,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ComponentRunStatus } from '@/types/architecture'

const ICONS: Record<string, LucideIcon> = {
  User,
  MessageSquare,
  History,
  Brain,
  Sparkles,
  ListChecks,
  Cog,
  Database,
  CircleCheck,
  Eye,
  ShieldCheck,
  ListTree,
  FileJson,
  Workflow,
  Receipt,
  BellRing,
  PackageCheck,
}

export interface ArchitectureNodeRenderData extends Record<string, unknown> {
  title: string
  description: string
  icon: string
  status: ComponentRunStatus
  isSelected: boolean
  dimmed?: boolean
  speed?: number
  paused?: boolean
}

export type ArchitectureFlowNode = Node<ArchitectureNodeRenderData, 'architectureNode'>

const STATUS_CLASSES: Record<ComponentRunStatus, string> = {
  inactive: 'border-border bg-card text-muted-foreground',
  running: 'border-primary bg-accent text-foreground shadow-[0_0_0_4px_var(--color-accent)]',
  completed: 'border-success/40 bg-success/10 text-foreground',
  failed: 'border-destructive bg-destructive/10 text-foreground',
}

export const STATUS_LABEL: Record<ComponentRunStatus, string> = {
  inactive: 'not yet reached',
  running: 'currently running',
  completed: 'completed',
  failed: 'failed validation',
}

export function ArchitectureNode({ data }: NodeProps<ArchitectureFlowNode>) {
  const Icon = ICONS[data.icon] ?? Sparkles
  const statusClass = STATUS_CLASSES[data.status]
  const prefersReducedMotion = usePrefersReducedMotion()
  const speed = data.speed ?? 1
  const shouldPulse = data.status === 'running' && !prefersReducedMotion && !data.paused

  return (
    <motion.div
      whileHover={{ y: -3 }}
      animate={{
        scale: shouldPulse ? [1, 1.03, 1] : 1,
        opacity: data.dimmed ? 0.4 : 1,
      }}
      transition={{
        y: { duration: 0.15, ease: 'easeOut' },
        scale: { duration: 0.4 / speed, ease: 'easeInOut' },
        opacity: { duration: 0.3, ease: 'easeOut' },
      }}
      className={`w-[220px] cursor-pointer rounded-xl border-2 p-3.5 shadow-sm transition-colors duration-300 ${statusClass} ${
        data.isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-border" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-border" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-border" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-border" />

      <div className="flex items-center gap-2">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
            data.status === 'running'
              ? 'bg-primary text-primary-foreground'
              : data.status === 'failed'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="text-[13px] font-semibold leading-tight">{data.title}</span>
        {data.status === 'completed' && <CircleCheck className="ml-auto size-4 shrink-0 text-success" />}
        {data.status === 'failed' && <TriangleAlert className="ml-auto size-4 shrink-0 text-destructive" />}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{data.description}</p>
    </motion.div>
  )
}
