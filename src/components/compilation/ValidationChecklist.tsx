import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { ValidationCheck } from '@/types/compilation'

export function ValidationChecklist({ checks }: { checks: ValidationCheck[] }) {
  return (
    <ul className="space-y-1.5">
      <AnimatePresence initial={false}>
        {checks.map((check) => (
          <motion.li
            key={check.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm ${
              check.status === 'passed' ? 'bg-success/10 text-foreground' : 'bg-destructive/10 text-foreground'
            }`}
          >
            {check.status === 'passed' ? (
              <Check className="size-4 shrink-0 text-success" />
            ) : (
              <X className="size-4 shrink-0 text-destructive" />
            )}
            <span>{check.label}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
