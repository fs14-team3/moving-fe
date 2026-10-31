import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMoverReviews } from '@/features/movers/api'
import { MOCK_REVIEWS } from '@/features/movers/fixtures/reviews'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'

vi.mock('@/features/movers/api', () => ({ getMoverReviews: vi.fn() }))

function renderUseMoverReviews(
  query: Parameters<typeof useMoverReviews>[1] = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMoverReviews('1', query), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMoverReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('페이지 조건에 맞는 리뷰 목록을 반환한다', async () => {
    const query = { page: 2, pageSize: 5 }
    const response = {
      items: MOCK_REVIEWS,
      page: 2,
      pageSize: 5,
      totalCount: 6,
      totalPages: 2,
    }
    vi.mocked(getMoverReviews).mockResolvedValue(response)

    const { result } = renderUseMoverReviews(query)

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getMoverReviews).toHaveBeenCalledWith('1', query)
    expect(result.current.reviews).toEqual(MOCK_REVIEWS)
    expect(result.current.totalCount).toBe(6)
    expect(result.current.totalPages).toBe(2)
  })

  it('조회에 실패하면 빈 목록과 오류 상태를 반환한다', async () => {
    vi.mocked(getMoverReviews).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseMoverReviews()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.reviews).toEqual([])
  })
})
