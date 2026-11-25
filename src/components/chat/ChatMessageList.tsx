import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/features/chat/types'
import {
  formatMessageDate,
  formatMessageTime,
} from '@/features/chat/lib/messageFormat'

type ChatMessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
}

export default function ChatMessageList({
  messages,
  currentUserId,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-gray-500">
        아직 대화가 없습니다. 첫 메시지를 보내 보세요.
      </div>
    )
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 md:px-6">
      {sortedMessages.map((message, index) => {
        const isMine = message.senderId === currentUserId
        const previousMessage = sortedMessages[index - 1]
        const showDate =
          !previousMessage ||
          formatMessageDate(previousMessage.createdAt) !==
            formatMessageDate(message.createdAt)

        return (
          <div key={message.id}>
            {showDate && (
              <div className="mb-5 flex justify-center">
                <span className="rounded-full bg-background-200 px-3 py-1.5 text-xs text-gray-500">
                  {formatMessageDate(message.createdAt)}
                </span>
              </div>
            )}

            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`flex max-w-[85%] items-end gap-2 md:max-w-[70%] ${
                  isMine ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isMine
                      ? 'rounded-br-sm bg-primary-400 text-white'
                      : 'rounded-bl-sm bg-background-200 text-black-400'
                  }`}
                >
                  {!isMine && (
                    <p className="mb-1 text-xs font-semibold text-black-300">
                      {message.senderName ?? '상대방'}
                    </p>
                  )}

                  <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                <span className="shrink-0 pb-1 text-[11px] text-gray-500">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}
