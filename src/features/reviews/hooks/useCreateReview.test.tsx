import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { createReview } from '@/features/reviews/api'
import { useCreateReview } from '@/features/reviews/hooks/useCreateReview'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/reviews/api', () => ({ createReview: vi.fn() }))

type CreatedReview = Awaited<ReturnType<typeof createReview>>

const body = { quoteId: 'quote-1', rating: 5, content: '친절하고 꼼꼼하셨어요' }

function renderUseCreateReview() {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useCreateReview(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useCreateReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('등록하면 알리고 리뷰 목록과 기사님 정보를 다시 불러온다', async () => {
    vi.mocked(createReview).mockResolvedValue({} as CreatedReview)
    const { result, invalidateQueries } = renderUseCreateReview()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createReview).toHaveBeenCalledWith(body)
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.review.createSuccess,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.reviews.all,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.movers.all,
    })
  })

  it.each([
    [
      '작성할 수 없는 견적(REVIEW_NOT_ALLOWED)',
      new ApiError('REVIEW_NOT_ALLOWED', 'Forbidden', 403),
    ],
    ['없는 견적(404)', new ApiError('NOT_FOUND', 'Not Found', 404)],
  ])('%s이면 알리고 목록을 다시 불러온다', async (_name, error) => {
    vi.mocked(createReview).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseCreateReview()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.review.notAllowed,
      ),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.reviews.all,
    })
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 등록 실패로 알린다', async (_name, error) => {
    vi.mocked(createReview).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseCreateReview()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.review.createFailed,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(createReview).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseCreateReview()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
