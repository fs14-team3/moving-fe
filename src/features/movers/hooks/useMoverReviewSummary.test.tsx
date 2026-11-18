import { useMoverReviewSummary } from '@/features/movers/hooks/useMoverReviewSummary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMoverReviewSummary } from '../api'
import { MOCK_REVIEW_SUMMARY } from '../fixtures/reviews'

vi.mock('@/features/movers/api', () => ({ getMoverReviewSummary: vi.fn() }))

function renderUseMoverReviewSummary() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMoverReviewSummary('1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMoverReviewSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('리뷰 요약을 반환한다', async () => {
    const response = MOCK_REVIEW_SUMMARY
    vi.mocked(getMoverReviewSummary).mockResolvedValue(response)

    const { result } = renderUseMoverReviewSummary()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(getMoverReviewSummary).toHaveBeenCalledWith('1')
    expect(result.current.reviewSummary).toEqual(MOCK_REVIEW_SUMMARY)
  })

  it('리뷰 요약이 없으면 null을 반환한다', async () => {
    vi.mocked(getMoverReviewSummary).mockResolvedValue(null)

    const { result } = renderUseMoverReviewSummary()

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.isError).toBe(false)
    expect(result.current.reviewSummary).toBeNull()
  })

  it('조회에 실패하면 오류 상태를 반환한다', async () => {
    vi.mocked(getMoverReviewSummary).mockRejectedValue(
      new Error('Network Error'),
    )

    const { result } = renderUseMoverReviewSummary()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.reviewSummary).toBeUndefined()
  })
})
