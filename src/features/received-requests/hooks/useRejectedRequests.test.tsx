import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getRejectedRequests,
  type RejectedRequest,
} from '@/features/received-requests/api'
import { useRejectedRequests } from '@/features/received-requests/hooks/useRejectedRequests'

vi.mock('@/features/received-requests/api', () => ({
  getRejectedRequests: vi.fn(),
}))

function createRejected(id: string): RejectedRequest {
  return {
    moveRequest: {
      id,
      customerName: '김코드',
      moveType: 'SMALL',
      moveDate: '2026-11-20',
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'PENDING',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
    rejectedAt: '2026-10-31T09:00:00.000Z',
  }
}

function renderUseRejectedRequests() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useRejectedRequests(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useRejectedRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('첫 페이지를 불러오고, 다음 페이지는 커서로 이어 붙인다', async () => {
    vi.mocked(getRejectedRequests)
      .mockResolvedValueOnce({
        items: [createRejected('1')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        items: [createRejected('2')],
        hasNext: false,
        nextCursor: null,
      })

    const { result } = renderUseRejectedRequests()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getRejectedRequests).toHaveBeenCalledWith({ cursor: undefined })
    expect(result.current.hasNextPage).toBe(true)

    act(() => {
      void result.current.fetchNextPage()
    })

    await waitFor(() =>
      expect(
        result.current.rejectedRequests.map((item) => item.moveRequest.id),
      ).toEqual(['1', '2']),
    )
    expect(getRejectedRequests).toHaveBeenLastCalledWith({
      cursor: 'cursor-2',
    })
    expect(result.current.hasNextPage).toBe(false)
  })

  it('조회에 실패하면 빈 목록과 오류 상태를 반환한다', async () => {
    vi.mocked(getRejectedRequests).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseRejectedRequests()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.rejectedRequests).toEqual([])
    expect(result.current.hasData).toBe(false)
  })
})
