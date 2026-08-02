import { ArrowRight } from 'lucide-react'
import { DefinitionCard } from './DefinitionCard'
import type { NotificationRule } from '@/types/applicationDefinition'
import type { SectionStatus } from '@/types/completeness'

export function NotificationCard({
  rules,
  status,
  highlighted,
}: {
  rules: NotificationRule[]
  status: SectionStatus
  highlighted: boolean
}) {
  return (
    <DefinitionCard
      title="Notifications"
      status={status}
      highlighted={highlighted}
      isEmpty={rules.length === 0}
      emptyMessage="Notifications will appear once the AI extracts messaging rules."
    >
      <div className="space-y-1.5">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5">{rule.event}</span>
            <ArrowRight className="size-3 text-muted-foreground" />
            <span className="rounded bg-muted px-1.5 py-0.5">{rule.recipient}</span>
            <ArrowRight className="size-3 text-muted-foreground" />
            <span className="rounded bg-muted px-1.5 py-0.5">{rule.channel}</span>
          </div>
        ))}
      </div>
    </DefinitionCard>
  )
}
