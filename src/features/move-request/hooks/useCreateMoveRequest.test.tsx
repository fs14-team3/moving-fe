import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { createMoveRequest } from '@/features/move-request/api'
import { useCreateMoveRequest } from '@/features/move-request/hooks/useCreateMoveRequest'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MOCK_CREATE_MOVE_REQUEST_BODY,
  MOCK_MOVE_REQUEST,
} from '../fixtures/moveRequests'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/move-request/api', () => ({ createMoveRequest: vi.fn() }))

function renderUseCreateMoveRequest() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useCreateMoveRequest(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, invalidateQueries }
}

describe('useCreateMoveRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('견적 요청에 성공하면 완료를 알리고 활성 견적 요청을 다시 불러온다', async () => {
    vi.mocked(createMoveRequest).mockResolvedValue(MOCK_MOVE_REQUEST)

    const { result, invalidateQueries } = renderUseCreateMoveRequest()

    act(() => result.current.mutate(MOCK_CREATE_MOVE_REQUEST_BODY))

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.moveRequests.active(),
      }),
    )

    expect(createMoveRequest).toHaveBeenCalledWith(
      MOCK_CREATE_MOVE_REQUEST_BODY,
      expect.anything(),
    )
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.requestSuccess,
    )
  })

  it('견적 요청에 실패하면 오류 토스트를 표시한다', async () => {
    vi.mocked(createMoveRequest).mockRejectedValue(new Error('Network Error'))

    const { result } = renderUseCreateMoveRequest()

    act(() => result.current.mutate(MOCK_CREATE_MOVE_REQUEST_BODY))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.requestFailed,
      ),
    )
  })

  it('인증 오류는 별도의 오류 토스트를 표시하지 않는다', async () => {
    vi.mocked(createMoveRequest).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )

    const { result } = renderUseCreateMoveRequest()

    act(() => result.current.mutate(MOCK_CREATE_MOVE_REQUEST_BODY))

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('이미 진행 중인 요청이 있으면 안내하고 활성 견적 요청을 다시 불러온다', async () => {
    vi.mocked(createMoveRequest).mockRejectedValue(
      new ApiError('ACTIVE_REQUEST_EXISTS', 'Conflict', 409),
    )

    const { result, invalidateQueries } = renderUseCreateMoveRequest()

    act(() => result.current.mutate(MOCK_CREATE_MOVE_REQUEST_BODY))

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.moveRequests.active(),
      }),
    )
    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.activeRequestExists,
    )
  })
})
