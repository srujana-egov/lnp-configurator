import { ConversationHeader } from './ConversationHeader'
import { ConversationMessages } from './ConversationMessages'
import { SuggestedReplies } from './SuggestedReplies'
import { ConversationControls } from './ConversationControls'
import { useDemo } from '@/hooks/useDemo'

export function ConversationPanel() {
  const { messages, currentBeat, next } = useDemo()
  const lastMessage = messages[messages.length - 1]
  const showSuggestions = Boolean(currentBeat?.waitsForUser && lastMessage?.suggestedReplies?.length)

  return (
    <section className="flex w-[25%] flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <ConversationHeader />
      <ConversationMessages messages={messages} />
      {showSuggestions && lastMessage?.suggestedReplies && (
        <SuggestedReplies suggestions={lastMessage.suggestedReplies} onSelect={next} />
      )}
      <ConversationControls />
    </section>
  )
}
