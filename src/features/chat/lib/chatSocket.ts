import { io, type Socket } from 'socket.io-client'
import type { ChatMessageImage } from '@/features/chat/types'

export type ChatSocketMessage = {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  createdAt: string
  senderName: string | null
  images: ChatMessageImage[]
}

export type ChatReadEvent = {
  chatRoomId: string
  userId: string
  lastReadAt: string
}

type ServerToClientEvents = {
  'chat:message:new': (message: ChatSocketMessage) => void
  'chat:read': (payload: ChatReadEvent) => void
}

type ClientToServerEvents = {
  'chat:join': (payload: { chatRoomId: string }) => void
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function createChatSocket(): ChatSocket {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.')
  }

  const socketUrl = new URL(apiUrl).origin

  return io(socketUrl, {
    autoConnect: false,
    withCredentials: true,
  })
}
