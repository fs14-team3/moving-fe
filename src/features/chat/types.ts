import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ChatRoom = Schemas['ChatRoomListItem']
export type ChatMessage = Schemas['ChatMessage']
export type ChatMessageListResponse = Schemas['ChatMessageListResponse']
