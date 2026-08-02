import { motion } from 'framer-motion'
import { useTypewriter } from '@/hooks/useTypewriter'
import type { ConversationMessage } from '@/types/scenario'

const VARIANTS = {
  administrator: {
    initial: { opacity: 0, x: 24 },
    align: 'items-end',
    bubble: 'bg-card border border-border text-foreground',
  },
  ai: {
    initial: { opacity: 0, x: -24 },
    align: 'items-start',
    bubble: 'bg-accent text-accent-foreground',
  },
  system: {
    initial: { opacity: 0 },
    align: 'items-center',
    bubble: 'bg-muted text-muted-foreground text-xs',
  },
} as const

export function MessageBubble({ message, isLatest }: { message: ConversationMessage; isLatest: boolean }) {
  const variant = VARIANTS[message.role]
  const { displayedText } = useTypewriter(message.text, message.role !== 'ai' || !isLatest)

  return (
    <motion.div
      initial={variant.initial}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex w-full flex-col ${variant.align}`}
    >
      <span className={`rounded-lg px-3 py-2 text-sm ${variant.bubble} max-w-[85%]`}>
        {message.role === 'ai' ? displayedText : message.text}
      </span>
    </motion.div>
  )
}
