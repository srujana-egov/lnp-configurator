import { ArrowDown } from 'lucide-react'
import type { NotificationRule } from '@/types/applicationDefinition'

export function NotificationPreview({ rules }: { rules: NotificationRule[] }) {
  if (rules.length === 0) {
    return <p className="text-xs text-muted-foreground">Notifications will appear once the AI extracts messaging rules.</p>
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div key={rule.id} className="flex flex-col items-center gap-1">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">{rule.event}</div>
          <ArrowDown className="size-4 text-muted-foreground" />
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">{rule.recipient}</div>
          <ArrowDown className="size-4 text-muted-foreground" />
          <div className="rounded-lg border border-primary bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            {rule.channel}
          </div>
        </div>
      ))}
    </div>
  )
}
