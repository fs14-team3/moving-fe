import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  deleteProofPhoto,
  type ProofPhotoList,
} from '@/features/proof-photos/api'
import { useDeleteProofPhoto } from '@/features/proof-photos/hooks/useDeleteProofPhoto'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/proof-photos/api', () => ({ deleteProofPhoto: vi.fn() }))

const queryKey = queryKeys.proofPhotos.list('quote-1')

const LIST: ProofPhotoList = {
  items: ['a', 'b'].map((id) => ({
    id,
    url: `https://img/${id}`,
    thumbnailUrl: `https://img/${id}-thumbnail`,
    createdAt: '2026-11-16T00:00:00.000Z',
  })),
  maxCount: 100,
  canEdit: true,
}

function renderUseDeleteProofPhoto() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  queryClient.setQueryData(queryKey, LIST)
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

  const { result } = renderHook(() => useDeleteProofPhoto('quote-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, invalidateQueries }
}

describe('useDeleteProofPhoto', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('삭제에 성공하면 완료를 알리고 목록에서 사진을 뺀다', async () => {
    vi.mocked(deleteProofPhoto).mockResolvedValue()
    const { result, queryClient, invalidateQueries } =
      renderUseDeleteProofPhoto()

    act(() => result.current.mutate('a'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteProofPhoto).toHaveBeenCalledWith('quote-1', 'a')
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.proofPhoto.deleteSuccess,
    )
    expect(queryClient.getQueryData<ProofPhotoList>(queryKey)?.items).toEqual([
      LIST.items[1],
    ])
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('삭제 전에 시작한 목록 조회가 늦게 끝나도 지운 사진을 되살리지 않는다', async () => {
    vi.mocked(deleteProofPhoto).mockResolvedValue()
    const { result, queryClient } = renderUseDeleteProofPhoto()
    let finishStaleFetch: (list: ProofPhotoList) => void = () => {}
    void queryClient
      .fetchQuery({
        queryKey,
        queryFn: () =>
          new Promise<ProofPhotoList>((resolve) => {
            finishStaleFetch = resolve
          }),
      })
      .catch(() => {})

    act(() => result.current.mutate('a'))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    finishStaleFetch(LIST)
    await new Promise((resolve) => setTimeout(resolve))

    expect(queryClient.getQueryData<ProofPhotoList>(queryKey)?.items).toEqual([
      LIST.items[1],
    ])
  })

  it.each([
    ['PROOF_PHOTO_REVIEWED', 409, TOAST_MESSAGES.proofPhoto.deleteReviewed],
    ['NOT_FOUND', 404, TOAST_MESSAGES.proofPhoto.deleteFailed],
  ])('%s면 알리고 목록을 다시 불러온다', async (code, status, message) => {
    vi.mocked(deleteProofPhoto).mockRejectedValue(
      new ApiError(code, 'Error', status),
    )
    const { result, invalidateQueries } = renderUseDeleteProofPhoto()

    act(() => result.current.mutate('a'))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message))
    expect(deleteProofPhoto).toHaveBeenCalledOnce()
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey })
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Error', 500)],
    ['네트워크 오류', new ApiError('NETWORK_ERROR', 'Network Error', null)],
  ])(
    '%s면 두 번 더 지워 보고 그래도 실패하면 알린 뒤 목록을 다시 불러온다',
    async (_, error) => {
      vi.useFakeTimers()
      vi.mocked(deleteProofPhoto).mockRejectedValue(error)
      const { result, invalidateQueries } = renderUseDeleteProofPhoto()

      act(() => result.current.mutate('a'))
      await act(() => vi.advanceTimersByTimeAsync(5000))

      expect(deleteProofPhoto).toHaveBeenCalledTimes(3)
      expect(result.current.isError).toBe(true)
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.proofPhoto.deleteFailed,
      )
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey })
    },
  )

  it('다시 지워 보다가 성공하면 실패를 알리지 않고 목록에서 사진을 뺀다', async () => {
    vi.useFakeTimers()
    vi.mocked(deleteProofPhoto)
      .mockRejectedValueOnce(new ApiError('INTERNAL_ERROR', 'Error', 500))
      .mockResolvedValueOnce()
    const { result, queryClient } = renderUseDeleteProofPhoto()

    act(() => result.current.mutate('a'))
    await act(() => vi.advanceTimersByTimeAsync(2000))

    expect(deleteProofPhoto).toHaveBeenCalledTimes(2)
    expect(result.current.isSuccess).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
    expect(queryClient.getQueryData<ProofPhotoList>(queryKey)?.items).toEqual([
      LIST.items[1],
    ])
  })

  it('인증 오류는 별도의 오류 토스트를 표시하지 않는다', async () => {
    vi.mocked(deleteProofPhoto).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseDeleteProofPhoto()

    act(() => result.current.mutate('a'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})
