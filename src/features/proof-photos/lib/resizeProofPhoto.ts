import type { ProofPhotoType } from '@/features/proof-photos/api'
import {
  resizePhoto,
  type ResizedPhoto,
} from '@/features/proof-photos/lib/resize'

type WorkerResult =
  { ok: true; photo: ResizedPhoto } | { ok: false; error: string }

let photoType: Promise<ProofPhotoType> | undefined
let worker: Worker | undefined
let workerFailed = false
let queue: Promise<unknown> = Promise.resolve()

async function canEncodeWebp() {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 2
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp'),
  )
  return blob?.type === 'image/webp'
}

export function pickPhotoType() {
  photoType ??= canEncodeWebp().then((webp) =>
    webp ? 'image/webp' : 'image/jpeg',
  )
  return photoType
}

function resizeInWorker(file: File, type: ProofPhotoType) {
  const current = (worker ??= new Worker(
    new URL('./resize.worker.ts', import.meta.url),
    { type: 'module' },
  ))
  return new Promise<ResizedPhoto>((resolve, reject) => {
    current.onmessage = ({ data }: MessageEvent<WorkerResult>) =>
      data.ok ? resolve(data.photo) : reject(new Error(data.error))
    current.onerror = () => {
      current.terminate()
      worker = undefined
      workerFailed = true
      resolve(resizePhoto(file, type))
    }
    current.postMessage({ file, type })
  })
}

export function resizeProofPhoto(file: File, type: ProofPhotoType) {
  const result = queue.then(() =>
    workerFailed ? resizePhoto(file, type) : resizeInWorker(file, type),
  )
  queue = result.catch(() => {})
  return result
}
