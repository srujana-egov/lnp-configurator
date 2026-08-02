import { ArrowDown } from 'lucide-react'
import { DefinitionCard } from './DefinitionCard'
import type { WorkflowState } from '@/types/applicationDefinition'
import type { SectionStatus } from '@/types/completeness'

export function WorkflowCard({
  states,
  status,
  highlighted,
}: {
  states: WorkflowState[]
  status: SectionStatus
  highlighted: boolean
}) {
  return (
    <DefinitionCard
      title="Workflow"
      status={status}
      highlighted={highlighted}
      isEmpty={states.length === 0}
      emptyMessage="The workflow will appear after AI extracts process information."
    >
      <div className="flex flex-col items-center gap-1">
        {states.map((state, index) => (
          <div key={state.id} className="flex flex-col items-center gap-1">
            <div className="rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium">
              {state.label}
              {state.assignedRole && <span className="ml-1 text-muted-foreground">· {state.assignedRole}</span>}
            </div>
            {index < states.length - 1 && <ArrowDown className="size-3 text-muted-foreground" />}
          </div>
        ))}
      </div>
    </DefinitionCard>
  )
}
