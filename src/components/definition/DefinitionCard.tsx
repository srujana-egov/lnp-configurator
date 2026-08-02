import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Check, CircleDashed } from 'lucide-react'
import type { SectionStatus } from '@/types/completeness'

const STATUS_ICON: Record<SectionStatus, ReactNode> = {
  complete: <Check className="size-3.5 text-success" />,
  partial: <AlertTriangle className="size-3.5 text-warning" />,
  missing: <CircleDashed className="size-3.5 text-muted-foreground" />,
}

export function DefinitionCard({
  title,
  status,
  highlighted,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string
  status?: SectionStatus
  highlighted?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: highlighted ? '0 0 0 2px var(--color-primary)' : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {status && <span className="flex items-center gap-1 text-xs">{STATUS_ICON[status]}</span>}
      </div>
      <div className="mt-2 text-sm text-foreground">
        {isEmpty ? <p className="text-xs text-muted-foreground">{emptyMessage}</p> : children}
      </div>
    </motion.div>
  )
}
