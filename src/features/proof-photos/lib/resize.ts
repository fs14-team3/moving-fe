import type { ProofPhotoType } from '@/features/proof-photos/api'
import { stripGainMap } from '@/features/proof-photos/lib/stripGainMap'

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
type Canvas = Context['canvas']

export type CreateContext = (width: number, height: number) => Context | null

export type ResizedPhoto = { image: Blob; thumbnail: Blob }

const IMAGE_EDGE = 2000
const THUMBNAIL_EDGE = 300
const THUMBNAIL_QUALITY = 0.8
const IMAGE_QUALITY: Record<ProofPhotoType, number> = {
  'image/webp': 0.9,
  'image/jpeg': 0.85,
}

function fit(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height))
  return [Math.round(width * scale), Math.round(height * scale)] as const
}

function draw(
  createContext: CreateContext,
  source: CanvasImageSource,
  width: number,
  height: number,
) {
  const context = createContext(width, height)
  if (!context) throw new Error('Canvas 2D context is unavailable')
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)
  return context.canvas
}

function release(canvas: Canvas) {
  canvas.width = 0
  canvas.height = 0
}

function stepDown(
  createContext: CreateContext,
  source: Canvas,
  width: number,
  height: number,
) {
  let current = source
  while (current.width / 2 >= width) {
    const next = draw(
      createContext,
      current,
      Math.round(current.width / 2),
      Math.round(current.height / 2),
    )
    if (current !== source) release(current)
    current = next
  }
  const result = draw(createContext, current, width, height)
  if (current !== source) release(current)
  return result
}

async function encode(canvas: Canvas, type: ProofPhotoType, quality: number) {
  const blob =
    'convertToBlob' in canvas
      ? await canvas.convertToBlob({ type, quality })
      : await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, type, quality),
        )
  if (blob?.type !== type) throw new Error(`Cannot encode ${type}`)
  return blob
}

export async function resizePhoto(
  createContext: CreateContext,
  file: Blob,
  type: ProofPhotoType,
): Promise<ResizedPhoto> {
  const bitmap = await createImageBitmap(await stripGainMap(file), {
    imageOrientation: 'from-image',
  })
  const [width, height] = fit(bitmap.width, bitmap.height, IMAGE_EDGE)
  const [thumbnailWidth, thumbnailHeight] = fit(
    bitmap.width,
    bitmap.height,
    THUMBNAIL_EDGE,
  )
  const canvas = draw(createContext, bitmap, width, height)
  bitmap.close()
  const image = await encode(canvas, type, IMAGE_QUALITY[type])
  const thumbnailCanvas = stepDown(
    createContext,
    canvas,
    thumbnailWidth,
    thumbnailHeight,
  )
  release(canvas)
  const thumbnail = await encode(thumbnailCanvas, type, THUMBNAIL_QUALITY)
  release(thumbnailCanvas)
  return { image, thumbnail }
}
