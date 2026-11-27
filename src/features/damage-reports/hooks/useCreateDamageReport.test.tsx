import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  createDamageReport,
  type DamageReport,
  type DamageReportList,
} from '@/features/damage-reports/api'
import { useCreateDamageReport } from '@/features/damage-reports/hooks/useCreateDamageReport'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/damage-reports/api', () => ({
  createDamageReport: vi.fn(),
}))

const queryKey = queryKeys.damageReports.list('quote-1')

const BODY = {
  itemName: '냉장고',
  description: '문짝이 찌그러졌어요.',
  uploadIds: ['upload-1'],
}

function report(id: string): DamageReport {
  return {
    id,
    itemName: BODY.itemName,
    description: BODY.description,
    createdAt: '2026-11-24T03:00:00.000Z',
    photos: [{ url: 'https://img/a', thumbnailUrl: 'https://img/a-thumbnail' }],
  }
}

const BEFORE: DamageReportList = { items: [report('old')], canReport: true }

function renderUseCreateDamageReport() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  queryClient.setQueryData(queryKey, BEFORE)
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useCreateDamageReport('quote-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, invalidateQueries }
}

describe('useCreateDamageReport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('접수에 성공하면 완료를 알리고 목록 맨 위에 추가한다', async () => {
    vi.mocked(createDamageReport).mockResolvedValue(report('new'))
    const { result, queryClient, invalidateQueries } =
      renderUseCreateDamageReport()

    act(() => result.current.mutate(BODY))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createDamageReport).toHaveBeenCalledWith('quote-1', BODY)
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.damageReport.createSuccess,
    )
    expect(queryClient.getQueryData(queryKey)).toEqual({
      items: [report('new'), report('old')],
      canReport: true,
    })
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('이미 목록에 있는 접수가 돌아오면 다시 추가하지 않는다', async () => {
    vi.mocked(createDamageReport).mockResolvedValue(report('old'))
    const { result, queryClient } = renderUseCreateDamageReport()

    act(() => result.current.mutate(BODY))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(queryKey)).toEqual(BEFORE)
  })

  it.each([
    ['DAMAGE_REPORT_NOT_ALLOWED', TOAST_MESSAGES.damageReport.notAllowed],
    ['DAMAGE_REPORT_CONFLICT', TOAST_MESSAGES.damageReport.conflict],
    ['DAMAGE_PHOTO_NOT_UPLOADED', TOAST_MESSAGES.damageReport.photoExpired],
    ['VALIDATION_ERROR', TOAST_MESSAGES.damageReport.createFailed],
  ])(
    '%s로 실패하면 다시 보내지 않고 이유를 알린 뒤 목록을 다시 불러온다',
    async (code, message) => {
      vi.mocked(createDamageReport).mockRejectedValue(
        new ApiError(code, 'Conflict', 409),
      )
      const { result, queryClient, invalidateQueries } =
        renderUseCreateDamageReport()

      act(() => result.current.mutate(BODY))

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(createDamageReport).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith(message)
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey })
      expect(queryClient.getQueryData(queryKey)).toEqual(BEFORE)
    },
  )

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Error', 500)],
    ['네트워크 오류', new ApiError('NETWORK_ERROR', 'Network Error', null)],
  ])(
    '%s면 같은 내용으로 두 번 더 보내 보고 그래도 실패하면 알린다',
    async (_, error) => {
      vi.useFakeTimers()
      vi.mocked(createDamageReport).mockRejectedValue(error)
      const { result } = renderUseCreateDamageReport()

      act(() => result.current.mutate(BODY))
      await act(() => vi.advanceTimersByTimeAsync(5000))

      expect(createDamageReport).toHaveBeenCalledTimes(3)
      expect(createDamageReport).toHaveBeenLastCalledWith('quote-1', BODY)
      expect(result.current.isError).toBe(true)
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.damageReport.createFailed,
      )
    },
  )

  it('다시 보내다가 성공하면 실패를 알리지 않고 목록에 추가한다', async () => {
    vi.useFakeTimers()
    vi.mocked(createDamageReport)
      .mockRejectedValueOnce(new ApiError('NETWORK_ERROR', 'Network', null))
      .mockResolvedValueOnce(report('new'))
    const { result, queryClient } = renderUseCreateDamageReport()

    act(() => result.current.mutate(BODY))
    await act(() => vi.advanceTimersByTimeAsync(2000))

    expect(createDamageReport).toHaveBeenCalledTimes(2)
    expect(result.current.isSuccess).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
    expect(
      queryClient.getQueryData<DamageReportList>(queryKey)?.items,
    ).toHaveLength(2)
  })

  it('로그인이 만료되면 따로 알리지 않는다', async () => {
    vi.mocked(createDamageReport).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'unauthorized', 401),
    )
    const { result } = renderUseCreateDamageReport()

    act(() => result.current.mutate(BODY))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
