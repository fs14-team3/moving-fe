import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ChatRoom = Schemas['ChatRoomListItem']

export type ChatMessageImage = {
  id: string
  url: string
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
  createdAt: string
}

export type ChatMessage = Omit<Schemas['ChatMessage'], 'images'> & {
  images: ChatMessageImage[]
}

export type ChatMessageListResponse = Omit<
  Schemas['ChatMessageListResponse'],
  'items'
> & {
  items: ChatMessage[]
}
