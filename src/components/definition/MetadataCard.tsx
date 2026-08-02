import { DefinitionCard } from './DefinitionCard'
import type { Metadata } from '@/types/applicationDefinition'
import type { SectionStatus } from '@/types/completeness'

export function MetadataCard({ metadata, status, highlighted }: { metadata: Metadata; status: SectionStatus; highlighted: boolean }) {
  const isEmpty = !metadata.name

  return (
    <DefinitionCard title="Metadata" status={status} highlighted={highlighted} isEmpty={isEmpty} emptyMessage="Metadata will appear once the AI extracts the application name.">
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <dt className="text-muted-foreground">Application Name</dt>
        <dd className="text-right font-medium">{metadata.name}</dd>
        <dt className="text-muted-foreground">Department</dt>
        <dd className="text-right font-medium">{metadata.department}</dd>
        <dt className="text-muted-foreground">Applicant</dt>
        <dd className="text-right font-medium">{metadata.applicantType}</dd>
      </dl>
    </DefinitionCard>
  )
}
