import { motion } from 'framer-motion'
import type { FeeRule } from '@/types/applicationDefinition'

export function FeePreview({ rules }: { rules: FeeRule[] }) {
  if (rules.length === 0) {
    return <p className="text-xs text-muted-foreground">Fee rules will appear once the AI extracts calculation logic.</p>
  }

  return (
    <div className="space-y-2">
      {rules.map((rule, index) => (
        <motion.div
          key={rule.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: index * 0.1 }}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
        >
          <span className="text-sm font-medium text-foreground">{rule.condition}</span>
          <span className="text-sm font-semibold text-primary">{rule.amount === 0 ? 'Free' : `£${rule.amount}`}</span>
        </motion.div>
      ))}
    </div>
  )
}
