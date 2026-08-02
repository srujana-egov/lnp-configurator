import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ARCHITECTURE_NODES, PHASE_2_NODES } from '@/data/architectureNodes'
import { ARCHITECTURE_RESEARCH } from '@/data/architectureResearch'
import type { ArchitectureComponentId } from '@/types/architecture'

const ALL_NODES = [...ARCHITECTURE_NODES, ...PHASE_2_NODES]

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="mt-1.5 text-sm text-foreground">{children}</div>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function ResearchDrawer({
  componentId,
  onClose,
}: {
  componentId: ArchitectureComponentId | null
  onClose: () => void
}) {
  const node = componentId ? ALL_NODES.find((n) => n.id === componentId) : null
  const content = componentId ? ARCHITECTURE_RESEARCH[componentId] : null

  useEffect(() => {
    if (!node) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [node, onClose])

  return (
    <AnimatePresence>
      {node && content && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-foreground/10"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            role="dialog"
            aria-label={`${node.title} research details`}
            className="fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col gap-4 overflow-y-auto border-l border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{node.title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close research drawer"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            <DrawerSection title="Purpose">{content.purpose}</DrawerSection>

            <DrawerSection title="Inputs">
              <BulletList items={content.inputs} />
            </DrawerSection>

            <DrawerSection title="Outputs">
              <BulletList items={content.outputs} />
            </DrawerSection>

            <DrawerSection title="Responsibilities">
              <BulletList items={content.responsibilities} />
            </DrawerSection>

            <DrawerSection title="Why This Component Exists">{content.whyItExists}</DrawerSection>

            <DrawerSection title="Related Architectural Decisions">
              <BulletList items={content.relatedDecisions} />
            </DrawerSection>

            <DrawerSection title="Example">
              <p className="rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">{content.example}</p>
            </DrawerSection>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
