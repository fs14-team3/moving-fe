import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resizePhoto,
  type CreateContext,
} from '@/features/proof-photos/lib/resize'

type FakeCanvas = {
  width: number
  height: number
  convertToBlob: ReturnType<typeof vi.fn>
}

function setup(width: number, height: number, encodedType?: string) {
  const canvases: FakeCanvas[] = []
  const sizes: number[][] = []
  const close = vi.fn()
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width, height, close })),
  )
  const createContext = ((w: number, h: number) => {
    sizes.push([w, h])
    const canvas: FakeCanvas = {
      width: w,
      height: h,
      convertToBlob: vi.fn(
        async ({ type }: { type: string }) =>
          new Blob([`${w}x${h}`], { type: encodedType ?? type }),
      ),
    }
    canvases.push(canvas)
    return { canvas, imageSmoothingQuality: 'low', drawImage: vi.fn() }
  }) as unknown as CreateContext
  return { createContext, canvases, sizes, close }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resizePhoto', () => {
  it('긴 변 2000px 사진과 절반씩 줄인 300px 썸네일을 만든다', async () => {
    const { createContext, canvases, sizes, close } = setup(4032, 3024)
    const file = new Blob(['original'], { type: 'image/jpeg' })

    const { image, thumbnail } = await resizePhoto(
      createContext,
      file,
      'image/webp',
    )

    expect(createImageBitmap).toHaveBeenCalledWith(file, {
      imageOrientation: 'from-image',
    })
    expect(sizes).toEqual([
      [2000, 1500],
      [1000, 750],
      [500, 375],
      [300, 225],
    ])
    expect(await image.text()).toBe('2000x1500')
    expect(await thumbnail.text()).toBe('300x225')
    expect(image.type).toBe('image/webp')
    expect(canvases[0].convertToBlob).toHaveBeenCalledWith({
      type: 'image/webp',
      quality: 0.9,
    })
    expect(canvases[3].convertToBlob).toHaveBeenCalledWith({
      type: 'image/webp',
      quality: 0.8,
    })
    expect(close).toHaveBeenCalledOnce()
    expect(canvases.every(({ width, height }) => !width && !height)).toBe(true)
  })

  it('세로 사진은 높이를 기준으로 줄이고 JPEG 품질 0.85로 인코딩한다', async () => {
    const { createContext, canvases, sizes } = setup(3024, 4032)

    await resizePhoto(createContext, new Blob(), 'image/jpeg')

    expect(sizes[0]).toEqual([1500, 2000])
    expect(sizes.at(-1)).toEqual([225, 300])
    expect(canvases[0].convertToBlob).toHaveBeenCalledWith({
      type: 'image/jpeg',
      quality: 0.85,
    })
  })

  it('GainMap을 지운 JPEG를 디코딩한다', async () => {
    const { createContext } = setup(4032, 3024)
    const jpeg = [0xff, 0xd8, 0xff, 0xd9]
    const file = new Blob([new Uint8Array([...jpeg, ...jpeg])], {
      type: 'image/jpeg',
    })

    await resizePhoto(createContext, file, 'image/jpeg')

    const [decoded] = vi.mocked(createImageBitmap).mock.calls[0]
    expect(new Uint8Array(await (decoded as Blob).arrayBuffer())).toEqual(
      new Uint8Array(jpeg),
    )
  })

  it('브라우저가 요청한 형식으로 인코딩하지 못하면 실패한다', async () => {
    const { createContext } = setup(4032, 3024, 'image/png')

    await expect(
      resizePhoto(createContext, new Blob(), 'image/webp'),
    ).rejects.toThrow('Cannot encode image/webp')
  })
})
