import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompilation } from '@/hooks/useCompilation'
import { ValidationChecklist } from './ValidationChecklist'
import { CompilationTrace } from './CompilationTrace'

export function CompilationProgressPanel() {
  const { status, visibleChecks, checks, trace, returnToReview } = useCompilation()
  const failedCheck = checks.find((c) => c.status === 'failed')

  return (
    <section className="flex w-[25%] flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Compilation Progress</h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground"
      >
        Application confirmed. Beginning deterministic compilation.
      </motion.p>

      <div aria-live="polite">
        <ValidationChecklist checks={status === 'validating' ? visibleChecks : checks} />
      </div>

      {status === 'failed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-3"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Compilation aborted.</p>
              {failedCheck && <p className="mt-1 text-xs text-destructive/90">{failedCheck.label}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={returnToReview} className="w-full">
            Return to Review
          </Button>
        </motion.div>
      )}

      {(status === 'compiling' || status === 'complete') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center gap-2 rounded-md bg-success/10 p-3 text-sm font-semibold text-success"
          aria-live="polite"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          Reference Resolution Complete
        </motion.div>
      )}

      <CompilationTrace trace={trace} />
    </section>
  )
}
