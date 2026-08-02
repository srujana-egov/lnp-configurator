import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { DemoProvider } from '@/context/DemoContext'
import { CompilationProvider } from '@/context/CompilationContext'
import { CaptureModeProvider } from '@/context/CaptureModeContext'
import { useDemo } from '@/hooks/useDemo'
import { useCompilation } from '@/hooks/useCompilation'
import { useCaptureMode } from '@/hooks/useCaptureMode'
import { Header } from '@/components/layout/Header'
import { ConversationPanel } from '@/components/conversation/ConversationPanel'
import { ArchitectureCanvas } from '@/components/architecture/ArchitectureCanvas'
import { ApplicationDefinitionPanel } from '@/components/definition/ApplicationDefinitionPanel'
import { ReviewScreen } from '@/components/definition/ReviewScreen'
import { CompilationProgressPanel } from '@/components/compilation/CompilationProgressPanel'
import { GeneratedFilesPanel } from '@/components/compilation/GeneratedFilesPanel'
import { Timeline } from '@/components/timeline/Timeline'
import { DEFAULT_SCENARIO_ID } from '@/data/scenarios'
import type { ScenarioId } from '@/types/scenario'

function CaptureModeOverlay() {
  return (
    <div className="flex h-screen flex-col gap-4 bg-background p-6">
      <ArchitectureCanvas captureMode />
    </div>
  )
}

function WorkspaceContent() {
  const { pause } = useDemo()
  const { isRunning } = useCompilation()
  const captureMode = useCaptureMode()

  useEffect(() => {
    if (captureMode.isActive) pause()
    // Intentionally reacting only to the capture-mode flag: `pause` is a fresh
    // function reference every render, so including it here would re-fire on
    // every render and pause the demo continuously instead of once on entry.
  }, [captureMode.isActive])

  if (captureMode.isActive) {
    return (
      <div className="capture-mode-active relative">
        <button
          type="button"
          onClick={captureMode.toggle}
          className="fixed right-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-3.5" />
          Exit Capture Mode
        </button>
        <CaptureModeOverlay />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 gap-6 overflow-hidden p-6">
        {isRunning ? <CompilationProgressPanel /> : <ConversationPanel />}
        <ArchitectureCanvas />
        {isRunning ? <GeneratedFilesPanel /> : <ApplicationDefinitionPanel />}
      </main>
      <Timeline />
      <ReviewScreen />
    </div>
  )
}

export function WorkspacePage() {
  const location = useLocation()
  const scenarioId = (location.state as { scenarioId?: ScenarioId } | null)?.scenarioId ?? DEFAULT_SCENARIO_ID

  return (
    <DemoProvider scenarioId={scenarioId}>
      <CompilationProvider>
        <CaptureModeProvider>
          <WorkspaceContent />
        </CaptureModeProvider>
      </CompilationProvider>
    </DemoProvider>
  )
}
