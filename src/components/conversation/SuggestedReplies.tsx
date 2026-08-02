import { motion } from 'framer-motion'

export function SuggestedReplies({ suggestions, onSelect }: { suggestions: string[]; onSelect: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          onClick={onSelect}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  )
}
