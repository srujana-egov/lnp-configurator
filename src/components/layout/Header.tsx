import { useEffect, useState } from 'react'
import { Camera, FlaskConical, LayoutGrid, Moon, Play, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useDemo } from '@/hooks/useDemo'
import { useCompilation } from '@/hooks/useCompilation'
import { useCaptureMode } from '@/hooks/useCaptureMode'
import { useEffectiveTimelineStage } from '@/hooks/useEffectiveTimelineStage'
import type { TimelineStageId } from '@/types/scenario'

const PHASE_LABEL: Record<TimelineStageId, string> = {
  conversation: 'Gathering Requirements',
  understanding: 'Understanding Request',
  operations: 'Generating Operations',
  definition: 'Building Application Definition',
  validation: 'Reviewing Application',
  compilation: 'Compiling Configuration',
  deployment: 'Ready for Deployment',
}

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const demo = useDemo()
  const compilation = useCompilation()
  const captureMode = useCaptureMode()
  const { stage } = useEffectiveTimelineStage()
  const [autoDemoActive, setAutoDemoActive] = useState(false)

  useEffect(() => {
    if (!autoDemoActive) return
    if (demo.isFinished && compilation.status === 'idle') {
      compilation.start()
      setAutoDemoActive(false)
    }
    // Deliberately keyed on the primitive status/finished flags rather than the
    // `compilation`/`demo` objects themselves, which are new references every
    // render and would otherwise re-fire this effect continuously.
  }, [autoDemoActive, demo.isFinished, compilation.status])

  const handlePlayCompleteDemo = () => {
    compilation.returnToReview()
    demo.restart()
    setAutoDemoActive(true)
    demo.play()
  }

  const isAutoRunning = autoDemoActive || demo.isPlaying || (compilation.isRunning && compilation.status !== 'complete' && compilation.status !== 'failed')

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <LayoutGrid className="size-6 text-primary" aria-hidden />
        <span className="text-lg font-semibold text-foreground">
          AI-Assisted DIGIT Application Configurator
        </span>
        <Badge variant="secondary">{compilation.isRunning ? 'Phase 2' : 'Phase 1'}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right text-xs text-muted-foreground" aria-live="polite">
          <p>{PHASE_LABEL[stage]}</p>
          <p className="font-semibold text-foreground">{demo.completeness.overall}% Complete</p>
        </div>

        <Button variant="outline" size="sm" onClick={handlePlayCompleteDemo} disabled={isAutoRunning}>
          <Play className="size-3.5" />
          {isAutoRunning ? 'Playing…' : 'Play Complete Demonstration'}
        </Button>

        <button
          type="button"
          onClick={captureMode.toggle}
          aria-pressed={captureMode.isActive}
          aria-label="Toggle capture mode for dissertation screenshots"
          className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${
            captureMode.isActive
              ? 'border-primary bg-accent text-primary'
              : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Camera className="size-4" />
        </button>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlaskConical className="size-4" aria-hidden />
          Research Mode
          <Switch aria-label="Toggle research mode" />
        </label>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  )
}
