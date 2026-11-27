import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDamagePhotoUploads } from '@/features/damage-reports/api'
import { useDamagePhotoUploads } from '@/features/damage-reports/hooks/useDamagePhotoUploads'
import { uploadToStorage } from '@/features/proof-photos/api'
import { resizeProofPhoto } from '@/features/proof-photos/lib/resizeProofPhoto'
import { ApiError } from '@/lib/api-error'

vi.mock('@/features/damage-reports/api', () => ({
  createDamagePhotoUploads: vi.fn(),
}))

vi.mock('@/features/proof-photos/api', () => ({
  uploadToStorage: vi.fn(),
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

const files = (count: number) =>
  Array.from({ length: count }, (_, i) => new File(['x'], `photo-${i}.jpg`))

const anySignal = expect.any(AbortSignal)

function renderUploads() {
  return renderHook(() => useDamagePhotoUploads('quote-1'))
}

async function advance(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms))
}

describe('useDamagePhotoUploads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    let issued = 0
    vi.mocked(createDamagePhotoUploads)
      .mockReset()
      .mockImplementation(async (_, { count }) =>
        Array.from({ length: count }, () =>
          post(String.fromCharCode(97 + issued++)),
        ),
      )
    vi.mocked(resizeProofPhoto)
      .mockReset()
      .mockResolvedValue({
        image: new Blob(['image']),
        thumbnail: new Blob(['t']),
      })
    vi.mocked(uploadToStorage).mockReset().mockResolvedValue()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('사진을 줄여 저장소에 올리고 접수할 때 쓸 업로드 ID와 함께 목록에 남긴다', async () => {
    const { result } = renderUploads()

    act(() => result.current.start(files(2)))

    await waitFor(() => expect(result.current.isUploading).toBe(false))
    expect(createDamagePhotoUploads).toHaveBeenCalledOnce()
    expect(createDamagePhotoUploads).toHaveBeenCalledWith(
      'quote-1',
      { count: 2, contentType: 'image/webp' },
      anySignal,
    )
    expect(resizeProofPhoto).toHaveBeenCalledTimes(2)
    expect(uploadToStorage).toHaveBeenCalledTimes(4)
    expect(result.current.uploads).toMatchObject([
      { status: 'uploaded', uploadId: 'a', previewUrl: 'blob:preview' },
      { status: 'uploaded', uploadId: 'b', previewUrl: 'blob:preview' },
    ])
    expect(result.current.failed).toEqual([])
  })

  it('저장소 업로드에 실패하면 잠시 뒤 새 업로드 정보로 자동으로 다시 올린다', async () => {
    vi.useFakeTimers()
    vi.mocked(uploadToStorage).mockRejectedValueOnce(new Error('403'))
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))
    await advance(0)

    expect(result.current.uploads[0].status).toBe('retrying')
    expect(result.current.isUploading).toBe(true)
    expect(vi.mocked(uploadToStorage).mock.calls[1][3]?.aborted).toBe(true)

    await advance(1000)

    expect(result.current.uploads).toMatchObject([
      { status: 'uploaded', uploadId: 'b' },
    ])
    expect(createDamagePhotoUploads).toHaveBeenCalledTimes(2)
  })

  it('멈춘 사진은 제한 시간 뒤 다시 시도하고 올린 사진은 남겨 둔다', async () => {
    vi.useFakeTimers()
    vi.mocked(uploadToStorage).mockImplementation(
      ({ fields }, _, __, signal) => {
        if (fields.key === 'a' || fields.key === 'a-t') return Promise.resolve()
        return new Promise<void>((_, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason), {
            once: true,
          })
        })
      },
    )
    const { result } = renderUploads()

    act(() => result.current.start(files(2)))
    await advance(89_999)
    expect(result.current.uploads).toMatchObject([
      { status: 'uploaded', uploadId: 'a' },
      { status: 'uploading' },
    ])

    await advance(1)
    expect(result.current.uploads[1].status).toBe('retrying')
    await advance(184_000)
    expect(uploadToStorage).toHaveBeenCalledTimes(8)
    expect(result.current.failed).toMatchObject([
      { status: 'failed', retryable: true },
    ])

    act(() => result.current.remove(result.current.failed[0].id))
    expect(result.current.uploads).toMatchObject([
      { status: 'uploaded', uploadId: 'a' },
    ])
    expect(result.current.isUploading).toBe(false)
  })

  it('사진 크기를 줄이는 중에 닫으면 미리보기를 만들거나 업로드하지 않는다', async () => {
    const { promise, resolve } =
      Promise.withResolvers<Awaited<ReturnType<typeof resizeProofPhoto>>>()
    vi.mocked(resizeProofPhoto).mockReturnValueOnce(promise)
    const { result, unmount } = renderUploads()

    act(() => result.current.start(files(1)))
    await waitFor(() => expect(resizeProofPhoto).toHaveBeenCalledOnce())
    unmount()
    await act(async () => {
      resolve({ image: new Blob(['image']), thumbnail: new Blob(['t']) })
    })

    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(createDamagePhotoUploads).not.toHaveBeenCalled()
    expect(uploadToStorage).not.toHaveBeenCalled()
  })

  it('접수 기간이 아니면 다시 시도할 수 없게 실패한다', async () => {
    vi.mocked(createDamagePhotoUploads).mockRejectedValue(
      new ApiError('DAMAGE_REPORT_NOT_ALLOWED', 'Conflict', 409),
    )
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))

    await waitFor(() => expect(result.current.failed).toHaveLength(1))
    expect(result.current.failed[0]).toMatchObject({
      error: '접수 기간이 아니에요',
      retryable: false,
    })
    expect(createDamagePhotoUploads).toHaveBeenCalledOnce()
  })

  it('자동으로 다시 올려도 실패하면 실패를 보여주고 직접 다시 시도할 수 있다', async () => {
    vi.useFakeTimers()
    vi.mocked(uploadToStorage).mockRejectedValue(new Error('network'))
    const { result } = renderUploads()

    act(() => result.current.start(files(1)))
    await advance(4000)

    expect(result.current.failed[0]).toMatchObject({
      error: '올리지 못했어요',
      retryable: true,
    })

    vi.mocked(uploadToStorage).mockResolvedValue()
    act(() => result.current.retry(result.current.failed))
    await advance(0)

    expect(result.current.uploads).toMatchObject([{ status: 'uploaded' }])
  })

  it('올린 사진이 만료되면 다시 올려야 하는 실패로 바꾸고 새 업로드 정보로 다시 올릴 수 있다', async () => {
    const { result } = renderUploads()
    act(() => result.current.start(files(2)))
    await waitFor(() => expect(result.current.isUploading).toBe(false))

    act(() => result.current.expire())

    expect(result.current.failed).toMatchObject([
      { error: '다시 올려 주세요', retryable: true, uploadId: undefined },
      { error: '다시 올려 주세요', retryable: true, uploadId: undefined },
    ])

    act(() => result.current.retry(result.current.failed))

    await waitFor(() => expect(result.current.failed).toHaveLength(0))
    await waitFor(() => expect(result.current.isUploading).toBe(false))
    expect(result.current.uploads).toMatchObject([
      { status: 'uploaded', uploadId: 'c' },
      { status: 'uploaded', uploadId: 'd' },
    ])
  })

  it('올린 사진을 지우면 목록에서 빠진다', async () => {
    const { result } = renderUploads()
    act(() => result.current.start(files(2)))
    await waitFor(() => expect(result.current.isUploading).toBe(false))

    act(() => result.current.remove(result.current.uploads[0].id))

    expect(result.current.uploads).toMatchObject([{ uploadId: 'b' }])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })
})
