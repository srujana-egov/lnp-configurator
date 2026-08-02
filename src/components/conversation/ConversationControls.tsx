import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemo } from '@/hooks/useDemo'
import type { PlaybackSpeed } from '@/context/DemoContext'

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 5]

export function ConversationControls() {
  const { isPlaying, play, pause, next, previous, restart, canGoNext, canGoPrevious, speed, setSpeed } = useDemo()

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={previous} disabled={!canGoPrevious} aria-label="Previous step">
          <SkipBack className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={isPlaying ? pause : play}
          disabled={!canGoNext && !isPlaying}
          aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
        <Button variant="outline" size="icon-sm" onClick={next} disabled={!canGoNext} aria-label="Next step">
          <SkipForward className="size-3.5" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={restart} aria-label="Restart demo">
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      <div role="radiogroup" aria-label="Playback speed" className="flex items-center gap-1 rounded-lg border border-border p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={speed === s}
            onClick={() => setSpeed(s)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}
