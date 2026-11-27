import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { compareQuotes } from '../api'
import { QuoteComparisonRequest } from '../types'
import { useCompareQuotes } from './useCompareQuotes'

const toast = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/quotes-compare/api', () => ({
  compareQuotes: vi.fn(),
}))

const body: QuoteComparisonRequest = {
  quoteIds: ['quote-1', 'quote-2'],
  keywords: ['PRICE'],
}

function renderUseCompareQuotes() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useCompareQuotes('request-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useCompareQuotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('비교에 성공하면 결과를 반환한다', async () => {
    const comparison = {
      quotes: [],
      recommendation: { quoteIds: ['quote-1'], reason: '가격이 가장 낮아요' },
    }
    vi.mocked(compareQuotes).mockResolvedValue(comparison)
    const { result } = renderUseCompareQuotes()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.data).toEqual(comparison))
    expect(compareQuotes).toHaveBeenCalledWith('request-1', body)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('비교할 수 없는 견적이 있으면 알리고 요청 목록을 다시 불러온다', async () => {
    vi.mocked(compareQuotes).mockRejectedValue(
      new ApiError('NOT_FOUND', 'Not Found', 404),
    )
    const { result, invalidateQueries } = renderUseCompareQuotes()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.compareStale,
      ),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.moveRequests.all,
    })
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 비교 실패로 알린다', async (_name, error) => {
    vi.mocked(compareQuotes).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseCompareQuotes()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.compareFailed,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(compareQuotes).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result, invalidateQueries } = renderUseCompareQuotes()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(compareQuotes).toHaveBeenCalled())
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(toast.error).not.toHaveBeenCalled()
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
