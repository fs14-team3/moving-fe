import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  confirmProofPhoto,
  createProofPhotoUploads,
  getProofPhotos,
  uploadToStorage,
} from '@/features/proof-photos/api'
import api from '@/lib/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getProofPhotos', () => {
  it('견적의 작업 사진 목록을 반환한다', async () => {
    const list = { items: [], maxCount: 100 }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: list })

    await expect(getProofPhotos('quote-1')).resolves.toEqual(list)
    expect(get).toHaveBeenCalledWith('/quotes/quote-1/proof-photos')
  })
})

describe('createProofPhotoUploads', () => {
  it('장수와 형식을 보내고 업로드 정보를 반환한다', async () => {
    const items = [{ uploadId: 'upload-1' }]
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { items } })
    const { signal } = new AbortController()

    await expect(
      createProofPhotoUploads(
        'quote-1',
        { count: 1, contentType: 'image/webp' },
        signal,
      ),
    ).resolves.toEqual(items)
    expect(post).toHaveBeenCalledWith(
      '/quotes/quote-1/proof-photos/uploads',
      { count: 1, contentType: 'image/webp' },
      { signal },
    )
  })
})

describe('uploadToStorage', () => {
  it('받은 필드를 담고 파일을 마지막에 넣어 업로드 주소로 보낸다', async () => {
    const post = vi
      .spyOn(axios, 'post')
      .mockImplementation(async (_url, _body, config) => {
        config?.onUploadProgress?.({ loaded: 42 } as never)
        return { data: '' }
      })
    const onProgress = vi.fn()
    const file = new Blob(['photo'], { type: 'image/webp' })
    const { signal } = new AbortController()

    await uploadToStorage(
      {
        url: 'https://bucket.s3.amazonaws.com',
        fields: { key: 'pending/proof-photos/a', 'Content-Type': 'image/webp' },
      },
      file,
      onProgress,
      signal,
    )

    const [url, body, config] = post.mock.calls[0]
    expect(url).toBe('https://bucket.s3.amazonaws.com')
    expect([...(body as FormData).keys()]).toEqual([
      'key',
      'Content-Type',
      'file',
    ])
    expect((body as FormData).get('file')).toBeInstanceOf(Blob)
    expect(onProgress).toHaveBeenCalledWith(42)
    expect(config?.signal).toBe(signal)
  })
})

describe('confirmProofPhoto', () => {
  it('업로드 ID로 사진을 확정하고 저장된 사진을 반환한다', async () => {
    const photo = { id: 'photo-1' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: photo })
    const { signal } = new AbortController()

    await expect(
      confirmProofPhoto('quote-1', 'upload-1', signal),
    ).resolves.toEqual(photo)
    expect(post).toHaveBeenCalledWith(
      '/quotes/quote-1/proof-photos',
      { uploadId: 'upload-1' },
      { signal },
    )
  })
})
