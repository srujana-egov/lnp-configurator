import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useDemo } from '@/hooks/useDemo'
import { useEffectiveTimelineStage } from '@/hooks/useEffectiveTimelineStage'
import { STAGE_ORDER } from '@/context/DemoContext'
import type { TimelineStageId } from '@/types/scenario'

const STAGE_LABELS: Record<TimelineStageId, string> = {
  conversation: 'Conversation',
  understanding: 'Understanding',
  operations: 'Operations',
  definition: 'Definition',
  validation: 'Validation',
  compilation: 'Compilation',
  deployment: 'Deployment',
}

export function Timeline() {
  const { jumpToStage } = useDemo()
  const { stage: effectiveStage, reachedStages: effectiveReachedStages, jumpableStages } = useEffectiveTimelineStage()

  const currentRank = STAGE_ORDER.indexOf(effectiveStage)

  return (
    <footer className="flex h-14 shrink-0 items-center gap-6 border-t border-border bg-card px-6">
      {STAGE_ORDER.map((stage, index) => {
        const isCurrent = stage === effectiveStage
        const isComplete = index < currentRank
        const isDisplayReached = effectiveReachedStages.has(stage)
        const isJumpable = jumpableStages.has(stage)

        return (
          <div key={stage} className="relative flex items-center gap-2">
            <button
              type="button"
              disabled={!isJumpable}
              onClick={() => jumpToStage(stage)}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isJumpable ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed'
              } ${
                isCurrent
                  ? 'font-semibold text-primary'
                  : isComplete
                    ? 'text-success'
                    : isDisplayReached
                      ? 'text-foreground'
                      : 'text-muted-foreground'
              }`}
            >
              {isComplete && <Check className="size-3.5" />}
              {STAGE_LABELS[stage]}
            </button>
            {isCurrent && (
              <motion.div
                layoutId="timeline-marker"
                className="absolute -bottom-1 left-1.5 right-1.5 h-0.5 rounded-full bg-primary"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            )}
            {index < STAGE_ORDER.length - 1 && (
              <span className="text-border" aria-hidden>
                →
              </span>
            )}
          </div>
        )
      })}
    </footer>
  )
}
