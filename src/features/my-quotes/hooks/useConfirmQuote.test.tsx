import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { confirmQuote } from '@/features/my-quotes/api'
import { useConfirmQuote } from '@/features/my-quotes/hooks/useConfirmQuote'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/my-quotes/api', () => ({ confirmQuote: vi.fn() }))

type ConfirmedQuote = Awaited<ReturnType<typeof confirmQuote>>

function renderUseConfirmQuote() {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useConfirmQuote(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useConfirmQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('확정하면 알리고 요청 · 견적 목록과 견적 상세를 다시 불러온다', async () => {
    vi.mocked(confirmQuote).mockResolvedValue({} as ConfirmedQuote)
    const { result, invalidateQueries } = renderUseConfirmQuote()

    act(() => result.current.mutate('quote-1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(confirmQuote).toHaveBeenCalledWith('quote-1')
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.confirmSuccess,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.moveRequests.all,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.quotes.detail('quote-1'),
    })
  })

  it.each([
    ['이미 없어진 견적(404)', new ApiError('NOT_FOUND', 'Not Found', 404)],
    [
      '이미 확정 · 만료된 요청(409)',
      new ApiError('REQUEST_NOT_PENDING', 'Conflict', 409),
    ],
  ])('%s이면 알리고 목록을 다시 불러온다', async (_name, error) => {
    vi.mocked(confirmQuote).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseConfirmQuote()

    act(() => result.current.mutate('quote-1'))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.confirmFailed,
      ),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.moveRequests.all,
    })
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 확정 실패로 알린다', async (_name, error) => {
    vi.mocked(confirmQuote).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseConfirmQuote()

    act(() => result.current.mutate('quote-1'))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.confirmFailed,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(confirmQuote).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseConfirmQuote()

    act(() => result.current.mutate('quote-1'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
