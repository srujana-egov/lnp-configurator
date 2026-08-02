import { motion } from 'framer-motion'
import type { RegistrySection } from '@/types/applicationDefinition'

export function FormPreview({ sections }: { sections: RegistrySection[] }) {
  if (sections.length === 0) {
    return <p className="text-xs text-muted-foreground">No form fields yet — the form mirrors the Registry once it exists.</p>
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className={`rounded-lg border p-3 ${section.conditional ? 'border-dashed' : 'border-border'}`}>
          <p className="text-xs font-semibold text-foreground">{section.title}</p>
          {section.conditional && <p className="text-[11px] text-muted-foreground">Only visible if born in hospital</p>}
          <div className="mt-2 space-y-2">
            {section.fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <label className="text-[11px] text-muted-foreground">{field.label}</label>
                <div className="mt-0.5 h-7 rounded-md border border-border bg-muted" />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
