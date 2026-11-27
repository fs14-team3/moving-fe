import axios from 'axios'
import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'
import type {
  ChatMessage,
  ChatMessageListResponse,
  ChatMessageImage,
} from '@/features/chat/types'

type Schemas = components['schemas']

type ChatListQuery = NonNullable<operations['listChats']['parameters']['query']>

type ChatMessageQuery = NonNullable<
  operations['listChatMessages']['parameters']['query']
>

type ReadResponse =
  operations['markChatRoomAsRead']['responses'][200]['content']['application/json']

export type ChatImageContentType = ChatMessageImage['contentType']

export type ChatImageUpload = {
  uploadId: string
  url: string
  fields: Record<string, string>
  contentType: ChatImageContentType
  maxSize: number
}

type ChatImageUploadResponse = {
  items: ChatImageUpload[]
}

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

// POST /chats/{chatRoomId}/images/uploads
export async function createChatImageUploads(
  chatRoomId: string,
  count: number,
  contentType: ChatImageContentType,
) {
  const { data } = await api.post<ChatImageUploadResponse>(
    `/chats/${chatRoomId}/images/uploads`,
    { count, contentType },
  )

  return data.items
}

// S3 Presigned POST upload
export async function uploadChatImage(upload: ChatImageUpload, file: File) {
  const body = new FormData()

  for (const [name, value] of Object.entries(upload.fields)) {
    body.append(name, value)
  }

  body.append('file', file)

  await axios.post(upload.url, body)
}

// POST /chats/{chatRoomId}/messages
export async function sendChatMessage(
  chatRoomId: string,
  content: string,
  imageUploadIds: string[] = [],
) {
  const { data } = await api.post<ChatMessage>(
    `/chats/${chatRoomId}/messages`,
    { content, imageUploadIds },
  )

  return data
}

// PATCH /chats/{chatRoomId}/read
export async function markChatRoomAsRead(chatRoomId: string) {
  const { data } = await api.patch<ReadResponse>(`/chats/${chatRoomId}/read`)

  return data
}
