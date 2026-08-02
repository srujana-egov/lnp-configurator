import { useDemo } from '@/hooks/useDemo'
import type { ArchitectureComponentId } from '@/types/architecture'

const THINKING_COMPONENTS: ArchitectureComponentId[] = [
  'ai-orchestrator',
  'understanding-engine',
  'structured-operations',
  'operation-executor',
]

function useAiStatus() {
  const { currentBeat, isFinished } = useDemo()
  if (isFinished) return 'Completed'
  if (!currentBeat) return 'Waiting'
  if (currentBeat.waitsForUser) return 'Question'
  if (THINKING_COMPONENTS.includes(currentBeat.activeComponent)) return 'Thinking'
  return 'Waiting'
}

export function ConversationHeader() {
  const status = useAiStatus()

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        {status}
      </span>
    </div>
  )
}
