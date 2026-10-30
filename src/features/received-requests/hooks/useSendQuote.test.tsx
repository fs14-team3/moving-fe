import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { sendQuote } from '@/features/received-requests/api'
import { useSendQuote } from '@/features/received-requests/hooks/useSendQuote'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/received-requests/api', () => ({ sendQuote: vi.fn() }))

const variables = { requestId: 'request-1', price: 250000 }

function renderUseSendQuote() {
  const queryClient = new QueryClient()
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useSendQuote(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useSendQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('견적을 보내면 알리고 받은 요청 목록을 다시 불러온다', async () => {
    vi.mocked(sendQuote).mockResolvedValue(
      {} as Awaited<ReturnType<typeof sendQuote>>,
    )
    const { result, invalidateQueries } = renderUseSendQuote()

    act(() => result.current.mutate(variables))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(sendQuote).toHaveBeenCalledWith('request-1', { price: 250000 })
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.sendSuccess,
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.receivedRequests.lists(),
    })
  })

  it.each([
    ['QUOTE_LIMIT_REACHED', TOAST_MESSAGES.estimate.quoteLimitReached],
    ['REQUEST_NOT_PENDING', TOAST_MESSAGES.estimate.requestNotPending],
  ])(
    '%s면 이유를 알리고 바뀐 요청 상태를 반영하도록 목록을 다시 불러온다',
    async (code, message) => {
      vi.mocked(sendQuote).mockRejectedValue(
        new ApiError(code, 'Conflict', 409),
      )
      const { result, invalidateQueries } = renderUseSendQuote()

      act(() => result.current.mutate(variables))

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message))
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.receivedRequests.lists(),
      })
    },
  )

  it('서비스 지역이 아닌 요청이면 이유를 알린다', async () => {
    vi.mocked(sendQuote).mockRejectedValue(
      new ApiError('NOT_IN_SERVICE_AREA', 'Forbidden', 403),
    )
    const { result, invalidateQueries } = renderUseSendQuote()

    act(() => result.current.mutate(variables))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.notInServiceArea,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 전송 실패로 알린다', async (_name, error) => {
    vi.mocked(sendQuote).mockRejectedValue(error)
    const { result, invalidateQueries } = renderUseSendQuote()

    act(() => result.current.mutate(variables))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.sendFailed,
      ),
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(sendQuote).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseSendQuote()

    act(() => result.current.mutate(variables))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
