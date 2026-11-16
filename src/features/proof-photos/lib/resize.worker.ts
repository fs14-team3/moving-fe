import type { ProofPhotoType } from '@/features/proof-photos/api'
import { resizePhoto } from '@/features/proof-photos/lib/resize'

const createContext = (width: number, height: number) =>
  new OffscreenCanvas(width, height).getContext('2d')

addEventListener(
  'message',
  async ({ data }: MessageEvent<{ file: File; type: ProofPhotoType }>) => {
    try {
      const photo = await resizePhoto(createContext, data.file, data.type)
      postMessage({ ok: true, photo })
    } catch (error) {
      postMessage({ ok: false, error: String(error) })
    }
  },
)
