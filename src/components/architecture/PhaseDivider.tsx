import { ArrowDown } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'

export function PhaseDivider(_props: NodeProps) {
  return (
    <div className="flex w-[220px] flex-col items-center gap-1.5 py-1 text-center">
      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Phase 1 · AI-Assisted Authoring
      </span>
      <ArrowDown className="size-3.5 text-muted-foreground" />
      <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
        Phase 2 · Deterministic Compilation
      </span>
    </div>
  )
}
