import { DefinitionCard } from './DefinitionCard'
import type { RegistrySection } from '@/types/applicationDefinition'
import type { SectionStatus } from '@/types/completeness'

export function RegistryCard({
  sections,
  status,
  highlighted,
}: {
  sections: RegistrySection[]
  status: SectionStatus
  highlighted: boolean
}) {
  return (
    <DefinitionCard
      title="Registry"
      status={status}
      highlighted={highlighted}
      isEmpty={sections.length === 0}
      emptyMessage="The registry will appear after AI extracts the information citizens must submit."
    >
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`rounded-md border p-2 ${section.conditional ? 'border-dashed border-border' : 'border-border'}`}
          >
            <p className="text-xs font-semibold text-foreground">{section.title}</p>
            <ul className="mt-1 space-y-0.5">
              {section.fields.map((field) => (
                <li key={field.id} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{field.label}</span>
                  <span className="font-mono text-[11px]">{field.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DefinitionCard>
  )
}
