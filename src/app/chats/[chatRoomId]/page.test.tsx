import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessageListResponse, ChatRoom } from '@/features/chat/types'
import type { Me } from '@/features/auth/types'
import type { ChatSocketMessage } from '@/features/chat/lib/chatSocket'
import ChatDetailPage from './page'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useQueryClient: vi.fn(),
  useCurrentUser: vi.fn(),
  useChatRooms: vi.fn(),
  useChatMessages: vi.fn(),
  useSendChatMessage: vi.fn(),
  useMarkChatRoomAsRead: vi.fn(),
  useChatRoomSocket: vi.fn(),
  markAsRead: vi.fn(),
  setQueryData: vi.fn(),
  socketOptions: null as null | {
    enabled?: boolean
    onMessage?: (message: ChatSocketMessage) => void
  },
}))

vi.mock('next/navigation', () => ({
  useParams: mocks.useParams,
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: mocks.useQueryClient,
}))

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: mocks.useCurrentUser,
}))

vi.mock('@/features/chat/hooks/useChatRooms', () => ({
  useChatRooms: mocks.useChatRooms,
}))

vi.mock('@/features/chat/hooks/useChatMessages', () => ({
  useChatMessages: mocks.useChatMessages,
}))

vi.mock('@/features/chat/hooks/useSendChatMessage', () => ({
  useSendChatMessage: mocks.useSendChatMessage,
}))

vi.mock('@/features/chat/hooks/useMarkChatRoomAsRead', () => ({
  useMarkChatRoomAsRead: mocks.useMarkChatRoomAsRead,
}))

vi.mock('@/features/chat/hooks/useChatRoomSocket', () => ({
  useChatRoomSocket: (options: {
    enabled?: boolean
    onMessage?: (message: ChatSocketMessage) => void
  }) => {
    mocks.socketOptions = options
  },
}))

vi.mock('@/components/chat/ChatHeader', () => ({
  default: () => null,
}))

vi.mock('@/components/chat/ChatMessageInput', () => ({
  default: () => null,
}))

vi.mock('@/components/chat/ChatMessageList', () => ({
  default: () => null,
}))

const user = { id: 'user-1' } as Me

const room = {
  id: 'room-1',
  quote: { status: 'CONFIRMED' },
} as ChatRoom

const messageResponse: ChatMessageListResponse = {
  items: [],
  nextCursor: null,
  hasNext: false,
}

const incomingMessage: ChatSocketMessage = {
  id: 'message-1',
  chatRoomId: 'room-1',
  senderId: 'user-2',
  senderName: '상대방',
  content: '안녕하세요',
  createdAt: '2026-11-25T10:00:00.000Z',
  images: [],
}

let messageCache: ChatMessageListResponse | undefined

function setVisibilityState(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  })
}

function emitSocketMessage(message: ChatSocketMessage) {
  act(() => {
    mocks.socketOptions?.onMessage?.(message)
  })
}

function renderPage() {
  return render(<ChatDetailPage />)
}

describe('ChatDetailPage 읽음 처리', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setVisibilityState('visible')

    messageCache = messageResponse

    mocks.socketOptions = null

    mocks.useParams.mockReturnValue({ chatRoomId: 'room-1' })
    mocks.useQueryClient.mockReturnValue({
      setQueryData: mocks.setQueryData,
    })

    mocks.setQueryData.mockImplementation(
      (
        _key: unknown,
        updater: (
          previous: ChatMessageListResponse | undefined,
        ) => ChatMessageListResponse | undefined,
      ) => {
        messageCache = updater(messageCache) ?? messageCache
      },
    )

    mocks.useCurrentUser.mockReturnValue({
      user,
      isPending: false,
    })

    mocks.useChatRooms.mockReturnValue({
      data: { items: [room] },
      isPending: false,
      isError: false,
    })

    mocks.useChatMessages.mockReturnValue({
      data: messageResponse,
      isPending: false,
      isError: false,
    })

    mocks.useSendChatMessage.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })

    mocks.useMarkChatRoomAsRead.mockReturnValue({
      mutate: mocks.markAsRead,
    })
  })

  it('메시지 조회가 성공하면 최초 읽음 처리를 한다', () => {
    renderPage()

    expect(mocks.markAsRead).toHaveBeenCalledTimes(1)
  })

  it('메시지 조회 중에는 읽음 처리와 소켓 연결을 하지 않는다', () => {
    mocks.useChatMessages.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    })

    renderPage()

    expect(mocks.markAsRead).not.toHaveBeenCalled()
    expect(mocks.socketOptions?.enabled).toBe(false)
  })

  it('메시지 조회에 실패하면 읽음 처리하지 않는다', () => {
    mocks.useChatMessages.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    })

    renderPage()

    expect(mocks.markAsRead).not.toHaveBeenCalled()
    expect(mocks.socketOptions?.enabled).toBe(false)
  })

  it('상대방의 새 메시지를 받으면 캐시에 추가하고 읽음 처리한다', () => {
    renderPage()
    mocks.markAsRead.mockClear()

    emitSocketMessage(incomingMessage)

    expect(messageCache?.items).toHaveLength(1)
    expect(messageCache?.items[0]?.id).toBe(incomingMessage.id)
    expect(mocks.markAsRead).toHaveBeenCalledTimes(1)
  })

  it('본인이 보낸 메시지는 읽음 처리하지 않는다', () => {
    renderPage()
    mocks.markAsRead.mockClear()

    emitSocketMessage({
      ...incomingMessage,
      senderId: 'user-1',
    })

    expect(messageCache?.items).toHaveLength(1)
    expect(mocks.markAsRead).not.toHaveBeenCalled()
  })

  it('이미 캐시에 있는 메시지는 중복 추가하거나 다시 읽음 처리하지 않는다', () => {
    renderPage()
    emitSocketMessage(incomingMessage)
    mocks.markAsRead.mockClear()

    emitSocketMessage(incomingMessage)

    expect(messageCache?.items).toHaveLength(1)
    expect(mocks.markAsRead).not.toHaveBeenCalled()
  })

  it('탭이 숨겨진 상태에서 최초 읽음 처리를 미루고 다시 보이면 처리한다', () => {
    setVisibilityState('hidden')

    renderPage()

    expect(mocks.markAsRead).not.toHaveBeenCalled()

    setVisibilityState('visible')

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(mocks.markAsRead).toHaveBeenCalledTimes(1)
  })

  it('탭이 숨겨진 상태에서 받은 상대방 메시지는 다시 보일 때 읽음 처리한다', () => {
    renderPage()
    mocks.markAsRead.mockClear()

    setVisibilityState('hidden')
    emitSocketMessage(incomingMessage)

    expect(mocks.markAsRead).not.toHaveBeenCalled()

    setVisibilityState('visible')

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(mocks.markAsRead).toHaveBeenCalledTimes(1)
  })
  it('메시지 캐시가 없으면 읽음 처리하지 않는다', () => {
    renderPage()
    mocks.markAsRead.mockClear()

    messageCache = undefined

    emitSocketMessage(incomingMessage)

    expect(messageCache).toBeUndefined()
    expect(mocks.markAsRead).not.toHaveBeenCalled()
  })
})
