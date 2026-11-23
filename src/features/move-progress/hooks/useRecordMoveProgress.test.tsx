import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  recordMoveProgress,
  type MoveProgress,
} from '@/features/move-progress/api'
import { useRecordMoveProgress } from '@/features/move-progress/hooks/useRecordMoveProgress'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/move-progress/api', () => ({ recordMoveProgress: vi.fn() }))

const queryKey = queryKeys.moveProgress.detail('quote-1')

const BEFORE: MoveProgress = {
  steps: [{ step: 'DEPARTED', recordedAt: '2026-11-23T00:10:00.000Z' }],
  nextStep: 'LOADING',
  canRecord: true,
}

const AFTER: MoveProgress = {
  steps: [
    ...BEFORE.steps,
    { step: 'LOADING', recordedAt: '2026-11-23T01:35:00.000Z' },
  ],
  nextStep: 'IN_TRANSIT',
  canRecord: true,
}

function renderUseRecordMoveProgress() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  queryClient.setQueryData(queryKey, BEFORE)
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useRecordMoveProgress('quote-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, invalidateQueries }
}

describe('useRecordMoveProgress', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('기록에 성공하면 완료를 알리고 응답으로 진행 상황을 바꾼다', async () => {
    vi.mocked(recordMoveProgress).mockResolvedValue(AFTER)
    const { result, queryClient, invalidateQueries } =
      renderUseRecordMoveProgress()

    act(() => result.current.mutate('LOADING'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(recordMoveProgress).toHaveBeenCalledWith('quote-1', 'LOADING')
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.moveProgress.recordSuccess('상차'),
    )
    expect(queryClient.getQueryData(queryKey)).toEqual(AFTER)
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it.each([
    ['MOVE_PROGRESS_OUT_OF_ORDER', TOAST_MESSAGES.moveProgress.outOfOrder],
    ['MOVE_PROGRESS_NOT_ALLOWED', TOAST_MESSAGES.moveProgress.notAllowed],
  ])(
    '%s로 실패하면 다시 보내지 않고 실패를 알린 뒤 진행 상황을 다시 불러온다',
    async (code, message) => {
      vi.mocked(recordMoveProgress).mockRejectedValue(
        new ApiError(code, 'Conflict', 409),
      )
      const { result, queryClient, invalidateQueries } =
        renderUseRecordMoveProgress()

      act(() => result.current.mutate('LOADING'))

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(recordMoveProgress).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith(message)
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey })
      expect(queryClient.getQueryData(queryKey)).toEqual(BEFORE)
    },
  )

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Error', 500)],
    ['네트워크 오류', new ApiError('NETWORK_ERROR', 'Network Error', null)],
  ])(
    '%s면 두 번 더 보내 보고 그래도 실패하면 알린 뒤 진행 상황을 다시 불러온다',
    async (_, error) => {
      vi.useFakeTimers()
      vi.mocked(recordMoveProgress).mockRejectedValue(error)
      const { result, invalidateQueries } = renderUseRecordMoveProgress()

      act(() => result.current.mutate('LOADING'))
      await act(() => vi.advanceTimersByTimeAsync(5000))

      expect(recordMoveProgress).toHaveBeenCalledTimes(3)
      expect(result.current.isError).toBe(true)
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.moveProgress.recordFailed,
      )
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey })
    },
  )

  it('다시 보내다가 성공하면 실패를 알리지 않고 진행 상황을 바꾼다', async () => {
    vi.useFakeTimers()
    vi.mocked(recordMoveProgress)
      .mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 'Network', null))
      .mockResolvedValueOnce(AFTER)
    const { result, queryClient } = renderUseRecordMoveProgress()

    act(() => result.current.mutate('LOADING'))
    await act(() => vi.advanceTimersByTimeAsync(2000))

    expect(recordMoveProgress).toHaveBeenCalledTimes(2)
    expect(recordMoveProgress).toHaveBeenLastCalledWith('quote-1', 'LOADING')
    expect(result.current.isSuccess).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(queryKey)).toEqual(AFTER)
  })

  it('로그인이 만료되면 따로 알리지 않는다', async () => {
    vi.mocked(recordMoveProgress).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'unauthorized', 401),
    )
    const { result } = renderUseRecordMoveProgress()

    act(() => result.current.mutate('LOADING'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
