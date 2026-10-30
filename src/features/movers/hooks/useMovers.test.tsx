import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMovers } from '@/features/movers/api'
import { useMovers } from '@/features/movers/hooks/useMovers'
import { MOCK_MOVERS } from '@/features/movers/fixtures/movers'

vi.mock('@/features/movers/api', () => ({ getMovers: vi.fn() }))

function createPage(
  items = [MOCK_MOVERS[0]],
  nextCursor: string | null = null,
) {
  return { items, nextCursor, hasNext: nextCursor !== null }
}

function renderUseMovers(filters: Parameters<typeof useMovers>[0] = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMovers(filters), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMovers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('조회 조건을 전달하고 첫 페이지를 반환한다', async () => {
    vi.mocked(getMovers).mockResolvedValue(createPage())
    const filters = {
      keyword: '김무빙',
      region: '서울' as const,
      serviceType: 'HOME' as const,
      sort: 'RATING' as const,
    }

    const { result } = renderUseMovers(filters)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getMovers).toHaveBeenCalledWith({ ...filters, cursor: undefined })
    expect(result.current.movers).toEqual([MOCK_MOVERS[0]])
  })

  it('다음 커서로 조회한 목록을 기존 목록에 이어 붙인다', async () => {
    vi.mocked(getMovers)
      .mockResolvedValueOnce(createPage([MOCK_MOVERS[0]], 'cursor-2'))
      .mockResolvedValueOnce(createPage([MOCK_MOVERS[1]]))
    const { result } = renderUseMovers()

    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
    await act(() => result.current.fetchNextPage())

    expect(getMovers).toHaveBeenNthCalledWith(2, { cursor: 'cursor-2' })
    await waitFor(() =>
      expect(result.current.movers).toEqual([MOCK_MOVERS[0], MOCK_MOVERS[1]]),
    )
    expect(result.current.hasNextPage).toBe(false)
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getMovers).mockRejectedValue(new Error('Network Error'))
    const { result } = renderUseMovers()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.movers).toEqual([])
  })
})
