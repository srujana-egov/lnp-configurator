import { useState } from 'react'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { FormPreview } from './FormPreview'
import { WorkflowPreview } from './WorkflowPreview'
import { FeePreview } from './FeePreview'
import { NotificationPreview } from './NotificationPreview'
import type { ApplicationDefinition } from '@/types/applicationDefinition'

type PreviewTab = 'form' | 'workflow' | 'fees' | 'notifications'

const TABS: { value: PreviewTab; label: string }[] = [
  { value: 'form', label: 'Form' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'fees', label: 'Fees' },
  { value: 'notifications', label: 'Notifications' },
]

export function PreviewPanel({ definition }: { definition: ApplicationDefinition }) {
  const [tab, setTab] = useState<PreviewTab>('form')

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <SegmentedControl aria-label="Preview tabs" fullWidth value={tab} onChange={setTab} options={TABS} />

      {tab === 'form' && <FormPreview sections={definition.registry.sections} />}
      {tab === 'workflow' && <WorkflowPreview states={definition.workflow.states} />}
      {tab === 'fees' && <FeePreview rules={definition.fees.rules} />}
      {tab === 'notifications' && <NotificationPreview rules={definition.notifications.rules} />}
    </div>
  )
}
