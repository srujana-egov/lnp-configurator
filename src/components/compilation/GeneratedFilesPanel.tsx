import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, PackageCheck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompilation } from '@/hooks/useCompilation'
import { useDemo } from '@/hooks/useDemo'
import { FileViewer } from './FileViewer'
import type { GeneratedFileId } from '@/types/compilation'

const FILES: { id: GeneratedFileId; filename: string }[] = [
  { id: 'registry', filename: 'registry.json' },
  { id: 'workflow', filename: 'workflow.json' },
  { id: 'calculation', filename: 'calculation.json' },
  { id: 'notification', filename: 'notification.json' },
]

export function GeneratedFilesPanel() {
  const { files, status } = useCompilation()
  const { restart: restartDemo } = useDemo()
  const [selectedFileId, setSelectedFileId] = useState<GeneratedFileId>('registry')

  useEffect(() => {
    const firstReady = FILES.find((f) => files[f.id])
    if (firstReady && !files[selectedFileId]) setSelectedFileId(firstReady.id)
  }, [files, selectedFileId])

  const selectedFile = files[selectedFileId]

  return (
    <section className="flex w-[30%] flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Generated Configuration Files</h2>

      {status === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-md bg-success/10 p-3 text-sm font-semibold text-success"
        >
          <span className="flex items-center gap-2">
            <PackageCheck className="size-4" />
            Ready for Deployment
          </span>
          <Button variant="outline" size="sm" onClick={restartDemo}>
            <RotateCcw className="size-3.5" />
            Restart Demo
          </Button>
        </motion.div>
      )}

      <ul className="space-y-1.5">
        {FILES.map((f, index) => {
          const ready = Boolean(files[f.id])
          return (
            <motion.li key={f.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: ready || status !== 'idle' ? 1 : 0.5, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
              <button
                type="button"
                disabled={!ready}
                aria-pressed={selectedFileId === f.id && ready}
                onClick={() => setSelectedFileId(f.id)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedFileId === f.id && ready ? 'border-primary bg-accent' : 'border-border'
                } ${ready ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed text-muted-foreground'}`}
              >
                <span className="font-mono">{f.filename}</span>
                {ready ? (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <Check className="size-3.5" /> Generated
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </button>
            </motion.li>
          )
        })}
      </ul>

      {selectedFile ? (
        <FileViewer file={selectedFile} />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
          Generated files will appear here once compilation succeeds.
        </div>
      )}
    </section>
  )
}
