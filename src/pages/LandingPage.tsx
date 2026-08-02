import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { SCENARIOS, DEFAULT_SCENARIO_ID } from '@/data/scenarios'
import type { ScenarioId } from '@/types/scenario'

export function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>(DEFAULT_SCENARIO_ID)

  return (
    <div className="relative flex h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="absolute right-6 top-6 inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <LayoutGrid className="size-10 text-primary" aria-hidden />

      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-foreground">AI-Assisted DIGIT Application Configurator</h1>
        <p className="text-sm font-medium text-primary">
          A Hybrid Architecture for AI-Assisted Government Application Authoring
        </p>
      </div>

      <p className="max-w-xl text-base text-muted-foreground">
        Create a government application using natural language. The AI will guide you
        while building a structured Application Definition.
      </p>

      <p className="max-w-xl text-sm text-muted-foreground">
        <strong className="text-foreground">Phase 1</strong> turns a conversation into a canonical Application
        Definition. <strong className="text-foreground">Phase 2</strong> compiles that definition into deployable
        DIGIT configuration files — deterministically, with no AI involved.
      </p>

      <div className="w-full max-w-xl">
        <p className="mb-2 text-left text-sm font-medium text-muted-foreground">Choose Demo Scenario</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(SCENARIOS).map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              aria-pressed={selectedScenarioId === scenario.id}
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selectedScenarioId === scenario.id
                  ? 'border-primary bg-accent'
                  : 'border-border bg-card hover:bg-muted'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" onClick={() => navigate('/workspace', { state: { scenarioId: selectedScenarioId } })}>
        Start Demo
      </Button>
    </div>
  )
}
