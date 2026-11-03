import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getNotifications,
  type Notification,
} from '@/features/notifications/api'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'

vi.mock('@/features/notifications/api', () => ({
  getNotifications: vi.fn(),
}))

function createNotification(id: string): Notification {
  return {
    id,
    userId: 'user-1',
    type: 'NEW_QUOTE',
    message: '김코드 기사님의 소형이사 견적이 도착했어요',
    payload: {},
    readAt: null,
    createdAt: '2026-11-03T10:00:00.000Z',
  }
}

function renderUseNotifications(options?: { enabled?: boolean }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useNotifications(options), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('첫 페이지를 불러오고, 다음 페이지는 커서로 이어 붙인다', async () => {
    vi.mocked(getNotifications)
      .mockResolvedValueOnce({
        items: [createNotification('1')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createNotification('2')],
        hasNext: false,
        nextCursor: null,
      })

    const { result } = renderUseNotifications()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getNotifications).toHaveBeenCalledWith({ cursor: undefined })

    act(() => {
      void result.current.fetchNextPage()
    })

    await waitFor(() =>
      expect(result.current.notifications.map(({ id }) => id)).toEqual([
        '1',
        '2',
      ]),
    )
    expect(getNotifications).toHaveBeenLastCalledWith({ cursor: 'cursor-2' })
    expect(result.current.hasNextPage).toBe(false)
  })

  it('enabled가 false면 불러오지 않는다', () => {
    const { result } = renderUseNotifications({ enabled: false })

    expect(getNotifications).not.toHaveBeenCalled()
    expect(result.current.notifications).toEqual([])
  })
})
