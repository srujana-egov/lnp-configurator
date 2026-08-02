import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { TraceEntry } from '@/types/compilation'

export function CompilationTrace({ trace }: { trace: TraceEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [trace.length])

  if (trace.length === 0) return null

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs">
      {trace.map((entry, index) => (
        <motion.p
          key={entry.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={index === trace.length - 1 ? 'text-foreground' : 'text-muted-foreground'}
        >
          <span className="text-muted-foreground">{entry.time}</span> {entry.message}
        </motion.p>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
