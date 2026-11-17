import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  confirmProofPhoto,
  createProofPhotoUploads,
  uploadToStorage,
  type ProofPhotoList,
} from '@/features/proof-photos/api'
import { useProofPhotoUploads } from '@/features/proof-photos/hooks/useProofPhotoUploads'
import { resizeProofPhoto } from '@/features/proof-photos/lib/resizeProofPhoto'
import { ApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

vi.mock('@/features/proof-photos/api', () => ({
  createProofPhotoUploads: vi.fn(),
  uploadToStorage: vi.fn(),
  confirmProofPhoto: vi.fn(),
}))

vi.mock('@/features/proof-photos/lib/resizeProofPhoto', () => ({
  pickPhotoType: vi.fn(async () => 'image/webp'),
  resizeProofPhoto: vi.fn(),
}))

URL.createObjectURL = vi.fn(() => 'blob:preview')
URL.revokeObjectURL = vi.fn()

const post = (uploadId: string) => ({
  uploadId,
  image: { url: 'https://bucket', fields: { key: `${uploadId}` } },
  thumbnail: { url: 'https://bucket', fields: { key: `${uploadId}-t` } },
})

const photo = (id: string) => ({
  id,
  url: `https://img/${id}`,
  thumbnailUrl: `https://img/${id}-thumbnail`,
  createdAt: '2026-11-16T00:00:00.000Z',
})

const files = (count: number) =>
  Array.from({ length: count }, (_, i) => new File(['x'], `photo-${i}.jpg`))

function renderUploads() {
  const queryClient = new QueryClient()
  queryClient.setQueryData<ProofPhotoList>(
    queryKeys.proofPhotos.list('quote-1'),
    { items: [], maxCount: 100 },
  )
  const view = renderHook(() => useProofPhotoUploads('quote-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  const list = () =>
    queryClient.getQueryData<ProofPhotoList>(
      queryKeys.proofPhotos.list('quote-1'),
    )
  return { ...view, list, queryClient }
}

const anySignal = expect.any(AbortSignal)

describe('useProofPhotoUploads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createProofPhotoUploads).mockReset()
    vi.mocked(resizeProofPhoto)
      .mockReset()
      .mockResolvedValue({
        image: new Blob(['image']),
        thumbnail: new Blob(['t']),
      })
    vi.mocked(uploadToStorage).mockReset().mockResolvedValue()
    vi.mocked(confirmProofPhoto)
      .mockReset()
      .mockImplementation(async (_, uploadId) => photo(`photo-${uploadId}`))
  })

  it('한 번에 업로드 정보를 받아 사진마다 올리고 확정한 뒤 목록에 추가한다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue([post('a'), post('b')])
    const { result, list } = renderUploads()

    act(() => result.current.start(files(2)))

    await waitFor(() => expect(result.current.uploads).toHaveLength(0))
    expect(createProofPhotoUploads).toHaveBeenCalledOnce()
    expect(createProofPhotoUploads).toHaveBeenCalledWith(
      'quote-1',
      { count: 2, contentType: 'image/webp' },
      anySignal,
    )
    expect(resizeProofPhoto).toHaveBeenCalledTimes(2)
    expect(uploadToStorage).toHaveBeenCalledTimes(4)
    expect(confirmProofPhoto).toHaveBeenCalledWith('quote-1', 'a', anySignal)
    expect(confirmProofPhoto).toHaveBeenCalledWith('quote-1', 'b', anySignal)
    expect(
      list()
        ?.items.map(({ id }) => id)
        .sort(),
    ).toEqual(['photo-a', 'photo-b'])
  })

  it('확정 전에 시작된 목록 조회가 늦게 끝나도 올린 사진을 덮어쓰지 않고 끝나면 목록을 다시 불러온다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue([post('a')])
    const { result, list, queryClient } = renderUploads()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    let finishStaleFetch: (list: ProofPhotoList) => void = () => {}
    void queryClient
      .fetchQuery({
        queryKey: queryKeys.proofPhotos.list('quote-1'),
        queryFn: () =>
          new Promise<ProofPhotoList>((resolve) => {
            finishStaleFetch = resolve
          }),
      })
      .catch(() => {})

    act(() => result.current.start(files(1)))
    await waitFor(() => expect(result.current.uploads).toHaveLength(0))
    finishStaleFetch({ items: [], maxCount: 100 })
    await new Promise((resolve) => setTimeout(resolve))

    expect(list()?.items.map(({ id }) => id)).toEqual(['photo-a'])
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: queryKeys.proofPhotos.list('quote-1'),
      }),
    )
  })

  it('저장소 업로드에 실패하면 다시 시도할 때 새 업로드 정보를 받는다', async () => {
    vi.mocked(createProofPhotoUploads)
      .mockResolvedValueOnce([post('a')])
      .mockResolvedValueOnce([post('b')])
    vi.mocked(uploadToStorage).mockRejectedValueOnce(new Error('403'))
    const { result, list } = renderUploads()

    act(() => result.current.start(files(1)))

    await waitFor(() => expect(result.current.failed).toHaveLength(1))
    expect(result.current.failed[0]).toMatchObject({
      error: '올리지 못했어요',
      retryable: true,
    })
    expect(result.current.failed[0].uploadId).toBeUndefined()

    act(() => result.current.retry(result.current.failed))

    await waitFor(() => expect(result.current.uploads).toHaveLength(0))
    expect(createProofPhotoUploads).toHaveBeenCalledTimes(2)
    expect(confirmProofPhoto).toHaveBeenCalledWith('quote-1', 'b', anySignal)
    expect(list()?.items).toHaveLength(1)
  })

  it('확정 응답을 받지 못하면 같은 업로드 ID로 확정만 다시 요청한다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue([post('a')])
    vi.mocked(confirmProofPhoto).mockRejectedValueOnce(
      new ApiError('NETWORK_ERROR', 'Network Error', null),
    )
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))

    await waitFor(() => expect(result.current.failed).toHaveLength(1))
    expect(result.current.failed[0].uploadId).toBe('a')

    act(() => result.current.retry(result.current.failed))

    await waitFor(() => expect(result.current.uploads).toHaveLength(0))
    expect(createProofPhotoUploads).toHaveBeenCalledOnce()
    expect(uploadToStorage).toHaveBeenCalledTimes(2)
    expect(confirmProofPhoto).toHaveBeenCalledTimes(2)
    expect(confirmProofPhoto).toHaveBeenLastCalledWith(
      'quote-1',
      'a',
      anySignal,
    )
  })

  it('S3에 사진이 없다는 응답이면 다시 시도할 때 사진을 다시 올린다', async () => {
    vi.mocked(createProofPhotoUploads)
      .mockResolvedValueOnce([post('a')])
      .mockResolvedValueOnce([post('b')])
    vi.mocked(confirmProofPhoto).mockRejectedValueOnce(
      new ApiError('PROOF_PHOTO_NOT_UPLOADED', 'Not uploaded', 409),
    )
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))

    await waitFor(() => expect(result.current.failed).toHaveLength(1))
    expect(result.current.failed[0].uploadId).toBeUndefined()

    act(() => result.current.retry(result.current.failed))

    await waitFor(() => expect(result.current.uploads).toHaveLength(0))
    expect(createProofPhotoUploads).toHaveBeenCalledTimes(2)
    expect(confirmProofPhoto).toHaveBeenLastCalledWith(
      'quote-1',
      'b',
      anySignal,
    )
  })

  it('열 수 없는 사진은 원본을 올리지 않고 다시 시도할 수 없게 실패한다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue([post('a')])
    vi.mocked(resizeProofPhoto).mockRejectedValueOnce(new Error('decode'))
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))

    await waitFor(() => expect(result.current.failed).toHaveLength(1))
    expect(result.current.failed[0]).toMatchObject({
      error: '사진을 열 수 없어요',
      retryable: false,
    })
    expect(uploadToStorage).not.toHaveBeenCalled()
    expect(confirmProofPhoto).not.toHaveBeenCalled()
  })

  it('최대 장수를 넘으면 다시 시도할 수 없게 실패한다', async () => {
    vi.mocked(createProofPhotoUploads).mockRejectedValue(
      new ApiError('PROOF_PHOTO_LIMIT_REACHED', 'Limit', 409),
    )
    const { result } = renderUploads()

    act(() => result.current.start(files(2)))

    await waitFor(() => expect(result.current.failed).toHaveLength(2))
    expect(result.current.failed[0]).toMatchObject({
      error: '최대 장수를 넘었어요',
      retryable: false,
    })
    expect(result.current.isUploading).toBe(false)
  })

  it('화면을 떠나면 올리던 요청을 취소한다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue(
      ['a', 'b', 'c', 'd'].map(post),
    )
    vi.mocked(uploadToStorage).mockReturnValue(new Promise(() => {}))
    const { result, unmount } = renderUploads()

    act(() => result.current.start(files(4)))
    await waitFor(() => expect(uploadToStorage).toHaveBeenCalledTimes(6))
    const signal = vi.mocked(uploadToStorage).mock.calls[0][3]

    unmount()

    expect(signal?.aborted).toBe(true)
  })

  it('실패한 사진을 지우면 목록에서 빠진다', async () => {
    vi.mocked(createProofPhotoUploads).mockResolvedValue([post('a')])
    vi.mocked(uploadToStorage).mockRejectedValue(new Error('403'))
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))
    await waitFor(() => expect(result.current.failed).toHaveLength(1))

    act(() => result.current.remove(result.current.failed[0].id))

    expect(result.current.uploads).toHaveLength(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })
})
