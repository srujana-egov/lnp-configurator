import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { ConversationMessage } from '@/types/scenario'

export function ConversationMessages({ messages }: { messages: ConversationMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
        The conversation will appear here.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-2">
      {messages.map((message, index) => (
        <MessageBubble key={message.id} message={message} isLatest={index === messages.length - 1} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
