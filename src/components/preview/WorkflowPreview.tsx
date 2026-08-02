import { ArrowDown } from 'lucide-react'
import type { WorkflowState } from '@/types/applicationDefinition'

export function WorkflowPreview({ states }: { states: WorkflowState[] }) {
  if (states.length === 0) {
    return <p className="text-xs text-muted-foreground">The workflow will appear after AI extracts process information.</p>
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {states.map((state, index) => (
        <div key={state.id} className="flex flex-col items-center gap-1">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm">
            {state.label}
          </div>
          {index < states.length - 1 && <ArrowDown className="size-4 text-muted-foreground" />}
        </div>
      ))}
    </div>
  )
}
