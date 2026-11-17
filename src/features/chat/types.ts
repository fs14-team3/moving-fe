import type { Role } from '@/features/auth/types'

export type ChatParticipant = {
  id: string
  name: string
  imageUrl: string | null
  role: Role
}

type ChatQuoteStatus = 'CONFIRMED' | 'NOT_SELECTED' | 'PENDING'

export type ChatRoom = {
  chatRoomId: string
  customer: ChatParticipant
  mover: ChatParticipant
  moveType: string
  moveDate: string
  quoteStatus: ChatQuoteStatus
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export type ChatMessage = {
  id: string
  chatRoomId: string
  senderId: string
  senderName: string
  senderRole: Role
  content: string
  createdAt: string
}
