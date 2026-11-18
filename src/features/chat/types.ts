import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ChatParticipant = Schemas['ChatOtherParticipant']
export type ChatRoom = Schemas['ChatRoomListItem']
export type ChatMessage = Schemas['ChatMessage']
export type ChatRoomListResponse = Schemas['ChatListResponse']
export type ChatMessageListResponse = Schemas['ChatMessageListResponse']
export type ChatQuoteStatus = Schemas['QuoteStatus']
