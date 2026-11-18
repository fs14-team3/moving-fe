import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ChatRoom = Schemas['ChatRoomListItem']
export type ChatMessage = Schemas['ChatMessage']

type ChatListQuery = NonNullable<operations['listChats']['parameters']['query']>

type ChatMessageQuery = NonNullable<
  operations['listChatMessages']['parameters']['query']
>

type ChatMessageListResponse = Schemas['ChatMessageListResponse']

type SendMessageResponse =
  operations['sendChatMessage']['responses'][201]['content']['application/json']

type ReadResponse =
  operations['markChatRoomAsRead']['responses'][200]['content']['application/json']

// GET /chats
export async function getChatRooms(query: ChatListQuery = {}) {
  const { data } = await api.get<Schemas['ChatListResponse']>('/chats', {
    params: query,
  })

  return data
}

// GET /chats/{chatRoomId}/messages
export async function getChatMessages(
  chatRoomId: string,
  query: ChatMessageQuery = {},
) {
  const { data } = await api.get<ChatMessageListResponse>(
    `/chats/${chatRoomId}/messages`,
    { params: query },
  )

  return data
}

// POST /chats/{chatRoomId}/messages
export async function sendChatMessage(chatRoomId: string, content: string) {
  const { data } = await api.post<SendMessageResponse>(
    `/chats/${chatRoomId}/messages`,
    { content } satisfies Schemas['SendChatMessageRequest'],
  )

  return data
}

// PATCH /chats/{chatRoomId}/read
export async function markChatRoomAsRead(chatRoomId: string) {
  const { data } = await api.patch<ReadResponse>(`/chats/${chatRoomId}/read`)

  return data
}
