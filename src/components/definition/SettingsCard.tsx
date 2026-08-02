import { DefinitionCard } from './DefinitionCard'
import type { ApplicationDefinition } from '@/types/applicationDefinition'

export function SettingsCard({ settings }: { settings: ApplicationDefinition['settings'] }) {
  return (
    <DefinitionCard title="Settings">
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <dt className="text-muted-foreground">Draft</dt>
        <dd className="text-right font-medium">{settings.draft ? 'Yes' : 'No'}</dd>
        <dt className="text-muted-foreground">Published</dt>
        <dd className="text-right font-medium">{settings.published ? 'Yes' : 'No'}</dd>
        <dt className="text-muted-foreground">Language</dt>
        <dd className="text-right font-medium">{settings.language}</dd>
      </dl>
    </DefinitionCard>
  )
}
