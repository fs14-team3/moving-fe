import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { createDesignation } from '@/features/move-request/api'
import {
  MOCK_DESIGNATION,
  MOCK_MOVE_REQUEST,
} from '@/features/move-request/fixtures/moveRequests'
import { useCreateDesignation } from '@/features/move-request/hooks/useCreateDesignation'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/move-request/api', () => ({ createDesignation: vi.fn() }))

function renderUseCreateDesignation() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useCreateDesignation(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

const requestId = MOCK_MOVE_REQUEST.id
const moverId = MOCK_DESIGNATION.moverId

describe('useCreateDesignation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('지정 견적 요청에 성공하면 완료를 알리고 쿼리를 갱신한다', async () => {
    vi.mocked(createDesignation).mockResolvedValue(MOCK_DESIGNATION)

    const { result, invalidateQueries } = renderUseCreateDesignation()

    act(() => result.current.mutate({ requestId, moverId }))

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.moveRequests.active(),
      }),
    )

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.movers.detail(moverId),
    })

    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.designationRequestSuccess,
    )

    expect(createDesignation).toHaveBeenCalledWith(requestId, moverId)
  })

  it('견적 요청에 실패하면 오류 토스트를 표시한다', async () => {
    vi.mocked(createDesignation).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseCreateDesignation()

    act(() => result.current.mutate({ requestId, moverId }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.designationRequestFailed,
      ),
    )
  })

  it('인증 오류는 별도의 오류 토스트를 표시하지 않는다', async () => {
    vi.mocked(createDesignation).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )

    const { result } = renderUseCreateDesignation()

    act(() => result.current.mutate({ requestId, moverId }))

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).not.toHaveBeenCalled()
  })

  it.each([
    ['REQUEST_NOT_PENDING', TOAST_MESSAGES.estimate.requestNotPending],
    ['ALREADY_DESIGNATED', TOAST_MESSAGES.estimate.alreadyDesignated],
    ['MOVER_ALREADY_RESPONDED', TOAST_MESSAGES.estimate.moverAlreadyResponded],
    [
      'DESIGNATION_LIMIT_REACHED',
      TOAST_MESSAGES.estimate.designationLimitReached,
    ],
  ])('%s면 해당 오류 토스트를 표시한다', async (code, message) => {
    vi.mocked(createDesignation).mockRejectedValue(
      new ApiError(code, 'Conflict', 409),
    )

    const { result } = renderUseCreateDesignation()

    act(() => result.current.mutate({ requestId, moverId }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message))
  })
})
