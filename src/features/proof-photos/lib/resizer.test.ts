import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/proof-photos/lib/resize', () => ({
  resizePhoto: vi.fn(async () => ({
    image: new Blob(['main']),
    thumbnail: new Blob(['main-thumbnail']),
  })),
}))

const fromWorker = {
  image: new Blob(['worker']),
  thumbnail: new Blob(['worker-thumbnail']),
}

class FakeWorker {
  static instances: FakeWorker[] = []
  static reply: (worker: FakeWorker) => void = () => {}
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  terminate = vi.fn()

  constructor() {
    FakeWorker.instances.push(this)
  }

  postMessage() {
    queueMicrotask(() => FakeWorker.reply(this))
  }
}

const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })

async function load() {
  const { resizeProofPhoto } =
    await import('@/features/proof-photos/lib/resizer')
  const { resizePhoto } = await import('@/features/proof-photos/lib/resize')
  return { resizeProofPhoto, resizePhoto: vi.mocked(resizePhoto) }
}

describe('resizeProofPhoto', () => {
  beforeEach(() => {
    vi.resetModules()
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('Worker에서 사진을 줄인다', async () => {
    FakeWorker.reply = (worker) =>
      worker.onmessage?.({ data: { ok: true, photo: fromWorker } })
    const { resizeProofPhoto, resizePhoto } = await load()

    await expect(resizeProofPhoto(file, 'image/webp')).resolves.toBe(fromWorker)
    expect(resizePhoto).not.toHaveBeenCalled()
  })

  it('사진을 읽지 못하면 그 사진만 실패하고 다음 사진은 같은 Worker로 줄인다', async () => {
    let calls = 0
    FakeWorker.reply = (worker) =>
      worker.onmessage?.({
        data:
          calls++ === 0
            ? { ok: false, error: 'decode failed' }
            : { ok: true, photo: fromWorker },
      })
    const { resizeProofPhoto } = await load()

    await expect(resizeProofPhoto(file, 'image/webp')).rejects.toThrow(
      'decode failed',
    )
    await expect(resizeProofPhoto(file, 'image/webp')).resolves.toBe(fromWorker)
    expect(FakeWorker.instances).toHaveLength(1)
  })

  it('Worker를 불러오지 못하면 메인 스레드에서 줄이고 다음 사진도 멈추지 않는다', async () => {
    FakeWorker.reply = (worker) =>
      worker.onerror?.(new ErrorEvent('error', { message: 'load failed' }))
    const { resizeProofPhoto, resizePhoto } = await load()

    const first = await resizeProofPhoto(file, 'image/webp')
    const second = await resizeProofPhoto(file, 'image/jpeg')

    expect(await first.image.text()).toBe('main')
    expect(await second.image.text()).toBe('main')
    expect(resizePhoto).toHaveBeenNthCalledWith(2, file, 'image/jpeg')
    expect(FakeWorker.instances).toHaveLength(1)
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
  })
})
