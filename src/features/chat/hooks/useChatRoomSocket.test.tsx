import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createChatSocket,
  type ChatReadEvent,
  type ChatSocket,
  type ChatSocketMessage,
} from '@/features/chat/lib/chatSocket'
import { useChatRoomSocket } from '@/features/chat/hooks/useChatRoomSocket'

const mocks = vi.hoisted(() => ({
  createChatSocket: vi.fn(),
}))

vi.mock('@/features/chat/lib/chatSocket', () => ({
  createChatSocket: mocks.createChatSocket,
}))

type SocketHandler = (...args: unknown[]) => void

function createMockSocket() {
  const handlers: Record<string, SocketHandler> = {}

  const socket = {
    on: vi.fn((event: string, handler: SocketHandler) => {
      handlers[event] = handler
      return socket
    }),
    off: vi.fn((event: string) => {
      delete handlers[event]
      return socket
    }),
    emit: vi.fn(),
    connect: vi.fn(() => {
      handlers.connect?.()
    }),
    disconnect: vi.fn(),
  }

  return {
    socket: socket as unknown as ChatSocket,
    handlers,
  }
}

describe('useChatRoomSocket', () => {
  let socket: ChatSocket
  let handlers: Record<string, SocketHandler>

  beforeEach(() => {
    vi.clearAllMocks()

    const mock = createMockSocket()
    socket = mock.socket
    handlers = mock.handlers

    vi.mocked(createChatSocket).mockReturnValue(socket)
  })

  it('채팅방에 연결되면 해당 방에 join 이벤트를 전송한다', () => {
    const { result } = renderHook(() =>
      useChatRoomSocket({ chatRoomId: 'room-1' }),
    )

    expect(createChatSocket).toHaveBeenCalledOnce()
    expect(socket.connect).toHaveBeenCalledOnce()
    expect(result.current.isConnected).toBe(true)
    expect(socket.emit).toHaveBeenCalledWith('chat:join', {
      chatRoomId: 'room-1',
    })
  })

  it('현재 채팅방의 새 메시지 이벤트를 전달한다', () => {
    const onMessage = vi.fn()

    renderHook(() =>
      useChatRoomSocket({
        chatRoomId: 'room-1',
        onMessage,
      }),
    )

    const message: ChatSocketMessage = {
      id: 'message-1',
      chatRoomId: 'room-1',
      senderId: 'user-1',
      senderName: '김고객',
      content: '안녕하세요.',
      createdAt: '2026-11-20T10:00:00.000Z',
      images: [],
    }

    act(() => {
      handlers['chat:message:new']?.(message)
    })

    expect(onMessage).toHaveBeenCalledWith(message)
  })

  it('다른 채팅방의 메시지 이벤트는 전달하지 않는다', () => {
    const onMessage = vi.fn()

    renderHook(() =>
      useChatRoomSocket({
        chatRoomId: 'room-1',
        onMessage,
      }),
    )

    const message: ChatSocketMessage = {
      id: 'message-2',
      chatRoomId: 'room-2',
      senderId: 'user-1',
      senderName: '김고객',
      content: '다른 채팅방 메시지',
      createdAt: '2026-11-20T10:00:00.000Z',
      images: [],
    }

    act(() => {
      handlers['chat:message:new']?.(message)
    })

    expect(onMessage).not.toHaveBeenCalled()
  })

  it('현재 채팅방의 읽음 이벤트를 전달한다', () => {
    const onRead = vi.fn()

    renderHook(() =>
      useChatRoomSocket({
        chatRoomId: 'room-1',
        onRead,
      }),
    )

    const event: ChatReadEvent = {
      chatRoomId: 'room-1',
      userId: 'user-2',
      lastReadAt: '2026-11-20T10:00:00.000Z',
    }

    act(() => {
      handlers['chat:read']?.(event)
    })

    expect(onRead).toHaveBeenCalledWith(event)
  })

  it('연결 오류가 발생하면 오류 상태를 반영한다', () => {
    const { result } = renderHook(() =>
      useChatRoomSocket({ chatRoomId: 'room-1' }),
    )

    const error = new Error('Connection failed')

    act(() => {
      handlers.connect_error?.(error)
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.connectionError).toBe('Connection failed')
  })

  it('Hook이 언마운트되면 이벤트를 해제하고 연결을 종료한다', () => {
    const { unmount } = renderHook(() =>
      useChatRoomSocket({ chatRoomId: 'room-1' }),
    )

    unmount()

    expect(socket.off).toHaveBeenCalledTimes(5)
    expect(socket.disconnect).toHaveBeenCalledOnce()
  })

  it('비활성화된 상태에서는 소켓을 생성하지 않는다', () => {
    renderHook(() =>
      useChatRoomSocket({
        chatRoomId: 'room-1',
        enabled: false,
      }),
    )

    expect(createChatSocket).not.toHaveBeenCalled()
  })
  it('비활성화되면 연결 상태와 오류 상태를 초기화한다', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useChatRoomSocket({
          chatRoomId: 'room-1',
          enabled,
        }),
      {
        initialProps: {
          enabled: true,
        },
      },
    )

    expect(result.current.isConnected).toBe(true)

    act(() => {
      handlers.connect_error?.(new Error('Connection failed'))
    })

    expect(result.current.connectionError).toBe('Connection failed')

    rerender({ enabled: false })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.connectionError).toBe(null)
    expect(socket.disconnect).toHaveBeenCalledOnce()
  })
})
