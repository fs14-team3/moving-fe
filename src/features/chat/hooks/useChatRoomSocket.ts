import { useEffect, useRef, useState } from 'react'
import {
  createChatSocket,
  type ChatReadEvent,
  type ChatSocketMessage,
} from '@/features/chat/lib/chatSocket'

type UseChatRoomSocketOptions = {
  chatRoomId: string
  enabled?: boolean
  onMessage?: (message: ChatSocketMessage) => void
  onRead?: (event: ChatReadEvent) => void
}

export function useChatRoomSocket({
  chatRoomId,
  enabled = true,
  onMessage,
  onRead,
}: UseChatRoomSocketOptions) {
  const [connectionState, setConnectionState] = useState<{
    chatRoomId: string
    enabled: boolean
    isConnected: boolean
    connectionError: string | null
  }>({
    chatRoomId,
    enabled,
    isConnected: false,
    connectionError: null,
  })

  const onMessageRef = useRef(onMessage)
  const onReadRef = useRef(onRead)

  useEffect(() => {
    onMessageRef.current = onMessage
    onReadRef.current = onRead
  }, [onMessage, onRead])

  useEffect(() => {
    if (!enabled || !chatRoomId) return

    const socket = createChatSocket()

    function handleConnect() {
      setConnectionState({
        chatRoomId,
        enabled,
        isConnected: true,
        connectionError: null,
      })

      socket.emit('chat:join', { chatRoomId })
    }

    function handleDisconnect() {
      setConnectionState({
        chatRoomId,
        enabled,
        isConnected: false,
        connectionError: null,
      })
    }

    function handleConnectError(error: Error) {
      setConnectionState({
        chatRoomId,
        enabled,
        isConnected: false,
        connectionError: error.message,
      })
    }

    function handleMessage(message: ChatSocketMessage) {
      if (message.chatRoomId !== chatRoomId) return
      onMessageRef.current?.(message)
    }

    function handleRead(event: ChatReadEvent) {
      if (event.chatRoomId !== chatRoomId) return
      onReadRef.current?.(event)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('chat:message:new', handleMessage)
    socket.on('chat:read', handleRead)

    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('chat:message:new', handleMessage)
      socket.off('chat:read', handleRead)
      socket.disconnect()
    }
  }, [chatRoomId, enabled])

  return {
    isConnected:
      enabled &&
      connectionState.chatRoomId === chatRoomId &&
      connectionState.enabled === enabled &&
      connectionState.isConnected,
    connectionError:
      connectionState.chatRoomId === chatRoomId &&
      connectionState.enabled === enabled
        ? connectionState.connectionError
        : null,
  }
}
