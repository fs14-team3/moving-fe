import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { rejectRequest } from '@/features/received-requests/api'
import { useRejectRequest } from '@/features/received-requests/hooks/useRejectRequest'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/received-requests/api', () => ({ rejectRequest: vi.fn() }))

type RejectedRequest = Awaited<ReturnType<typeof rejectRequest>>

function renderUseRejectRequest() {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useRejectRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useRejectRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('반려하면 알리고 받은 요청 목록과 반려한 요청 목록을 다시 불러온다', async () => {
    vi.mocked(rejectRequest).mockResolvedValue({} as RejectedRequest)
    const { result, invalidateQueries } = renderUseRejectRequest()

    act(() => result.current.mutate('request-1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(rejectRequest).toHaveBeenCalledWith('request-1')
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.rejectSuccess,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.receivedRequests.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.receivedRequests.rejected(),
    })
  })

  it('이미 없어진 요청(404)이면 알리고 목록을 다시 불러온다', async () => {
    vi.mocked(rejectRequest).mockRejectedValue(
      new ApiError('NOT_FOUND', 'Not Found', 404),
    )
    const { result, invalidateQueries } = renderUseRejectRequest()

    act(() => result.current.mutate('request-1'))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.rejectFailed,
      ),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.receivedRequests.lists(),
    })
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 반려 실패로 알린다', async (_name, error) => {
    vi.mocked(rejectRequest).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseRejectRequest()

    act(() => result.current.mutate('request-1'))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.rejectFailed,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(rejectRequest).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseRejectRequest()

    act(() => result.current.mutate('request-1'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
