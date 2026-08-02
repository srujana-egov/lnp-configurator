import { motion } from 'framer-motion'
import type { CompletenessSnapshot } from '@/types/completeness'

const LABELS: { key: keyof Omit<CompletenessSnapshot, 'overall'>; label: string }[] = [
  { key: 'metadata', label: 'Metadata' },
  { key: 'registry', label: 'Registry' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'roles', label: 'Roles' },
  { key: 'fees', label: 'Fees' },
  { key: 'notifications', label: 'Notifications' },
]

export function DefinitionProgress({ completeness }: { completeness: CompletenessSnapshot }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Completion</span>
        <span className="text-sm font-semibold text-foreground">{completeness.overall}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: completeness.overall >= 100 ? 'var(--color-success)' : 'var(--color-warning)' }}
          initial={{ width: 0 }}
          animate={{ width: `${completeness.overall}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
        {LABELS.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between text-muted-foreground">
            <span>{label}</span>
            <span
              className={
                completeness[key] === 'complete'
                  ? 'text-success'
                  : completeness[key] === 'partial'
                    ? 'text-warning'
                    : 'text-muted-foreground'
              }
            >
              {completeness[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
