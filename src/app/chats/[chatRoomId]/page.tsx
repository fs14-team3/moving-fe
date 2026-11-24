'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatMessageInput from '@/components/chat/ChatMessageInput'
import ChatMessageList from '@/components/chat/ChatMessageList'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useChatRooms } from '@/features/chat/hooks/useChatRooms'
import { useChatMessages } from '@/features/chat/hooks/useChatMessages'
import { useSendChatMessage } from '@/features/chat/hooks/useSendChatMessage'
import { useMarkChatRoomAsRead } from '@/features/chat/hooks/useMarkChatRoomAsRead'
import { useChatRoomSocket } from '@/features/chat/hooks/useChatRoomSocket'
import type { ChatMessageListResponse } from '@/features/chat/types'

export default function ChatDetailPage() {
  const params = useParams<{ chatRoomId: string }>()
  const queryClient = useQueryClient()
  const chatRoomId = params.chatRoomId

  const { user, isPending: isUserPending } = useCurrentUser()
  const {
    data: rooms,
    isPending: isRoomsPending,
    isError: isRoomsError,
  } = useChatRooms()

  const room = rooms?.items.find((item) => item.id === chatRoomId)

  const {
    data: messageResponse,
    isPending: isMessagesPending,
    isError: isMessagesError,
  } = useChatMessages(chatRoomId, Boolean(room && user))

  const sendMessage = useSendChatMessage(chatRoomId)
  const { mutate: markAsRead } = useMarkChatRoomAsRead(chatRoomId)

  const roomId = room?.id
  const userId = user?.id

  useEffect(() => {
    if (roomId && userId) {
      markAsRead()
    }
  }, [roomId, userId, markAsRead])

  useChatRoomSocket({
    chatRoomId,
    enabled: Boolean(user && room && !isUserPending && !isRoomsPending),
    onMessage: (message) => {
      queryClient.setQueryData<ChatMessageListResponse>(
        queryKeys.chats.messages(chatRoomId),
        (previous) => {
          if (!previous) return previous

          if (previous.items.some((item) => item.id === message.id)) {
            return previous
          }

          return {
            ...previous,
            items: [
              ...previous.items,
              {
                id: message.id,
                chatRoomId: message.chatRoomId,
                senderId: message.senderId,
                senderName: message.senderName,
                content: message.content,
                createdAt: message.createdAt,
              },
            ],
          }
        },
      )
    },
  })

  if (isUserPending || isRoomsPending) {
    return (
      <main className="flex min-h-page items-center justify-center text-sm text-gray-500">
        채팅방을 불러오는 중입니다.
      </main>
    )
  }

  if (!user || isRoomsError || !room) {
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

  const isReadOnly = room.quote.status === 'NOT_SELECTED'
  const messages = messageResponse?.items ?? []

  function handleSend(content: string) {
    sendMessage.mutate(content)
  }

  return (
    <main className="min-h-page px-3 py-4 md:px-8 md:py-8">
      <div className="mx-auto flex h-[calc(100dvh-150px)] min-h-120 max-w-5xl flex-col overflow-hidden rounded-xl border border-line-200 bg-white md:h-[calc(100dvh-170px)]">
        <ChatHeader room={room} />

        {isMessagesPending ? (
          <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">
            메시지를 불러오는 중입니다.
          </div>
        ) : isMessagesError ? (
          <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-red-500">
            메시지를 불러오지 못했습니다.
          </div>
        ) : (
          <ChatMessageList messages={messages} currentUserId={user.id} />
        )}

        {isReadOnly ? (
          <div className="border-t border-line-100 bg-background-200 px-4 py-4 text-center text-sm text-gray-500">
            선택되지 않은 견적의 채팅방입니다. 이전 대화만 확인할 수 있습니다.
          </div>
        ) : (
          <ChatMessageInput
            onSend={handleSend}
            disabled={
              sendMessage.isPending || isMessagesPending || isMessagesError
            }
          />
        )}
      </div>
    </main>
  )
}
