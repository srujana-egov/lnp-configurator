import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemo } from '@/hooks/useDemo'
import { useCompilation } from '@/hooks/useCompilation'
import { MetadataCard } from './MetadataCard'
import { RegistryCard } from './RegistryCard'
import { WorkflowCard } from './WorkflowCard'
import { RolesCard } from './RolesCard'
import { FeeCard } from './FeeCard'
import { NotificationCard } from './NotificationCard'

export function ReviewScreen() {
  const { currentBeat, applicationDefinition, completeness, beatIndex } = useDemo()
  const { status, start } = useCompilation()
  const [dismissed, setDismissed] = useState(false)
  const isReviewStage = currentBeat?.activeComponent === 'review'

  useEffect(() => {
    setDismissed(false)
  }, [beatIndex])

  const handleExport = () => {
    const slug = (applicationDefinition.metadata.name ?? 'application').toLowerCase().replace(/\s+/g, '-')
    const blob = new Blob([JSON.stringify(applicationDefinition, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${slug}-application-definition.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isReviewStage && !dismissed && status === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/20 p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-screen-title"
            className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success" aria-live="polite">
              <CheckCircle2 className="size-5" />
              <span className="text-sm font-semibold">
                Application Definition {completeness.overall}% complete — ready for review.
              </span>
            </div>

            <h2 id="review-screen-title" className="text-xl font-semibold text-foreground">Application Summary</h2>

            <div className="grid grid-cols-2 gap-3">
              <MetadataCard metadata={applicationDefinition.metadata} status={completeness.metadata} highlighted={false} />
              <RolesCard roles={applicationDefinition.roles} status={completeness.roles} highlighted={false} />
              <WorkflowCard states={applicationDefinition.workflow.states} status={completeness.workflow} highlighted={false} />
              <FeeCard rules={applicationDefinition.fees.rules} status={completeness.fees} highlighted={false} />
              <RegistryCard sections={applicationDefinition.registry.sections} status={completeness.registry} highlighted={false} />
              <NotificationCard rules={applicationDefinition.notifications.rules} status={completeness.notifications} highlighted={false} />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setDismissed(true)}>
                Edit Application
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="size-4" />
                Export Application Definition
              </Button>
              <Button onClick={start}>Compile Configuration</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
