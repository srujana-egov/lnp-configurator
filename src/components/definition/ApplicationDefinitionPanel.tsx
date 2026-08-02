import { useDemo } from '@/hooks/useDemo'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { DefinitionProgress } from './DefinitionProgress'
import { MetadataCard } from './MetadataCard'
import { RegistryCard } from './RegistryCard'
import { WorkflowCard } from './WorkflowCard'
import { RolesCard } from './RolesCard'
import { FeeCard } from './FeeCard'
import { NotificationCard } from './NotificationCard'
import { SettingsCard } from './SettingsCard'
import { JsonViewer } from './JsonViewer'
import { PreviewPanel } from '@/components/preview/PreviewPanel'

function hasPath(paths: string[], key: string) {
  return paths.includes(key)
}

export function ApplicationDefinitionPanel() {
  const { applicationDefinition, completeness, highlightPaths, viewMode, setViewMode, definitionViewMode, setDefinitionViewMode } =
    useDemo()

  return (
    <section className="flex w-[30%] flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Application Definition</h2>
        <SegmentedControl
          aria-label="Right panel view"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'definition', label: 'Definition' },
            { value: 'preview', label: 'Preview' },
          ]}
        />
      </div>

      {viewMode === 'preview' ? (
        <PreviewPanel definition={applicationDefinition} />
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-end">
            <SegmentedControl
              aria-label="Definition display mode"
              variant="subtle"
              value={definitionViewMode}
              onChange={setDefinitionViewMode}
              options={[
                { value: 'tree', label: 'Tree' },
                { value: 'json', label: 'JSON' },
              ]}
            />
          </div>

          {definitionViewMode === 'json' ? (
            <JsonViewer data={applicationDefinition} />
          ) : (
            <>
              <DefinitionProgress completeness={completeness} />
              <MetadataCard metadata={applicationDefinition.metadata} status={completeness.metadata} highlighted={hasPath(highlightPaths, 'metadata')} />
              <RegistryCard sections={applicationDefinition.registry.sections} status={completeness.registry} highlighted={hasPath(highlightPaths, 'registry')} />
              <WorkflowCard states={applicationDefinition.workflow.states} status={completeness.workflow} highlighted={hasPath(highlightPaths, 'workflow')} />
              <RolesCard roles={applicationDefinition.roles} status={completeness.roles} highlighted={hasPath(highlightPaths, 'roles')} />
              <FeeCard rules={applicationDefinition.fees.rules} status={completeness.fees} highlighted={hasPath(highlightPaths, 'fees')} />
              <NotificationCard rules={applicationDefinition.notifications.rules} status={completeness.notifications} highlighted={hasPath(highlightPaths, 'notifications')} />
              <SettingsCard settings={applicationDefinition.settings} />
            </>
          )}
        </div>
      )}
    </section>
  )
}
