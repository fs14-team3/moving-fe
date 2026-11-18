'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatMessageInput from '@/components/chat/ChatMessageInput'
import ChatMessageList from '@/components/chat/ChatMessageList'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { MOCK_CHAT_MESSAGES } from '@/features/chat/fixtures/chatMessages'
import { useChatRooms } from '@/features/chat/hooks/useChatRooms'
import type { ChatMessage } from '@/features/chat/types'

export default function ChatDetailPage() {
  const params = useParams<{ chatRoomId: string }>()
  const chatRoomId = params.chatRoomId

  const { user, isPending: isUserPending } = useCurrentUser()
  const { data: rooms, isPending: isRoomsPending } = useChatRooms()

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES)

  const room = rooms?.find((item) => item.chatRoomId === chatRoomId)

  if (isUserPending || isRoomsPending) {
    return (
      <main className="flex min-h-page items-center justify-center text-sm text-gray-500">
        채팅방을 불러오는 중입니다.
      </main>
    )
  }

  if (!user || !room) {
    return (
      <main className="flex min-h-page flex-col items-center justify-center px-4 text-center">
        <p className="font-semibold text-black-300">
          채팅방을 찾을 수 없습니다.
        </p>
        <Link
          href="/chats"
          className="mt-4 text-sm font-semibold text-primary-400 hover:underline"
        >
          채팅 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  const currentUser = user

  const opponent = currentUser.role === 'CUSTOMER' ? room.mover : room.customer
  const roomMessages = messages.filter(
    (message) => message.chatRoomId === chatRoomId,
  )
  const isReadOnly = room.quoteStatus === 'NOT_SELECTED'

  function handleSend(content: string) {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name ?? '나',
      senderRole: currentUser.role,
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages((previous) => [...previous, newMessage])
  }

  return (
    <main className="min-h-page px-3 py-4 md:px-8 md:py-8">
      <div className="mx-auto flex h-[calc(100dvh-150px)] min-h-120 max-w-5xl flex-col overflow-hidden rounded-xl border border-line-200 bg-white md:h-[calc(100dvh-170px)]">
        <ChatHeader room={room} opponent={opponent} />

        <ChatMessageList
          messages={roomMessages}
          currentUserRole={currentUser.role}
        />

        {isReadOnly ? (
          <div className="border-t border-line-100 bg-background-200 px-4 py-4 text-center text-sm text-gray-500">
            선택되지 않은 견적의 채팅방입니다. 이전 대화만 확인할 수 있습니다.
          </div>
        ) : (
          <ChatMessageInput onSend={handleSend} />
        )}
      </div>
    </main>
  )
}
