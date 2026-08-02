import { DefinitionCard } from './DefinitionCard'
import type { FeeRule } from '@/types/applicationDefinition'
import type { SectionStatus } from '@/types/completeness'

export function FeeCard({ rules, status, highlighted }: { rules: FeeRule[]; status: SectionStatus; highlighted: boolean }) {
  return (
    <DefinitionCard
      title="Fees"
      status={status}
      highlighted={highlighted}
      isEmpty={rules.length === 0}
      emptyMessage="Fee rules will appear once the AI extracts calculation logic."
    >
      <div className="space-y-1.5">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5 text-xs">
            <span className="text-foreground">{rule.condition}</span>
            <span className="font-mono font-medium text-foreground">
              {rule.amount === 0 ? 'Free' : `£${rule.amount}`}
            </span>
          </div>
        ))}
      </div>
    </DefinitionCard>
  )
}
