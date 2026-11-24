import { useEffect, useRef, useState } from 'react'
import {
  uploadToStorage,
  type ProofPhotoType,
  type ProofPhotoUpload,
} from '@/features/proof-photos/api'
import {
  pickPhotoType,
  resizeProofPhoto,
} from '@/features/proof-photos/lib/resizeProofPhoto'

const CONCURRENCY = 3
const UPLOADS_PER_REQUEST = 10
const RETRY_DELAYS = [1000, 3000]
const UPLOAD_ATTEMPT_TIMEOUT_MS = 90_000

export type PhotoUpload = {
  id: number
  file: File
  status:
    'waiting' | 'uploading' | 'confirming' | 'retrying' | 'uploaded' | 'failed'
  progress: number
  previewUrl?: string
  uploadId?: string
  error?: string
  retryable?: boolean
}

type UploadFailure = { error: string; retryable: boolean; reupload?: boolean }

type PhotoUploadsOptions = {
  createUploads: (
    body: { count: number; contentType: ProofPhotoType },
    signal: AbortSignal,
  ) => Promise<ProofPhotoUpload[]>
  confirm?: (uploadId: string, signal: AbortSignal) => Promise<void>
  toFailure: (error: unknown) => UploadFailure
  onFinish?: () => void
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runPool<T>(items: T[], run: (item: T) => Promise<void>) {
  const queue = [...items]
  const lane = async () => {
    let next = queue.shift()
    while (next) {
      await run(next)
      next = queue.shift()
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, lane))
}

export function usePhotoUploads({
  createUploads,
  confirm,
  toFailure,
  onFinish,
}: PhotoUploadsOptions) {
  const [uploads, setUploads] = useState<PhotoUpload[]>([])
  const nextId = useRef(0)
  const previewUrls = useRef(new Map<number, string>())
  const controller = useRef(new AbortController())

  const isUploading = uploads.some(
    ({ status }) => status !== 'failed' && status !== 'uploaded',
  )
  const failed = uploads.filter(({ status }) => status === 'failed')

  useEffect(() => {
    const urls = previewUrls.current
    const current = new AbortController()
    controller.current = current
    return () => {
      current.abort()
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  function update(id: number, patch: Partial<PhotoUpload>) {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload,
      ),
    )
  }

  function remove(id: number) {
    const url = previewUrls.current.get(id)
    if (url) URL.revokeObjectURL(url)
    previewUrls.current.delete(id)
    setUploads((prev) => prev.filter((upload) => upload.id !== id))
  }

  async function sendToStorage(
    { id, file }: PhotoUpload,
    type: ProofPhotoType,
    takeSlot: () => Promise<ProofPhotoUpload>,
    signal: AbortSignal,
  ) {
    let resized
    try {
      resized = await resizeProofPhoto(file, type)
    } catch {
      if (signal.aborted) return
      update(id, {
        status: 'failed',
        error: '사진을 열 수 없어요',
        retryable: false,
      })
      return
    }
    if (signal.aborted) return
    const { image, thumbnail } = resized

    if (!previewUrls.current.has(id)) {
      previewUrls.current.set(id, URL.createObjectURL(thumbnail))
    }
    update(id, { previewUrl: previewUrls.current.get(id) })
    const presigned = await takeSlot()
    if (signal.aborted) return
    update(id, { status: 'uploading', progress: 0 })
    const total = image.size + thumbnail.size
    const loaded = [0, 0]
    let shown = 0
    const report = (part: number) => (bytes: number) => {
      loaded[part] = bytes
      const progress = Math.min(
        100,
        Math.floor(((loaded[0] + loaded[1]) / total) * 100),
      )
      if (progress === shown) return
      shown = progress
      update(id, { progress })
    }
    const attempt = new AbortController()
    const abortAttempt = () => attempt.abort()
    signal.addEventListener('abort', abortAttempt, { once: true })
    const timeout = setTimeout(abortAttempt, UPLOAD_ATTEMPT_TIMEOUT_MS)
    try {
      await Promise.all([
        uploadToStorage(presigned.image, image, report(0), attempt.signal),
        uploadToStorage(
          presigned.thumbnail,
          thumbnail,
          report(1),
          attempt.signal,
        ),
      ])
    } finally {
      clearTimeout(timeout)
      signal.removeEventListener('abort', abortAttempt)
      abortAttempt()
    }
    update(id, { uploadId: presigned.uploadId, progress: 100 })
    return presigned.uploadId
  }

  async function process(
    upload: PhotoUpload,
    type: ProofPhotoType,
    takeSlot: () => Promise<ProofPhotoUpload>,
    signal: AbortSignal,
  ) {
    let { uploadId } = upload
    for (let attempt = 0; !signal.aborted; attempt++) {
      try {
        uploadId ??= await sendToStorage(upload, type, takeSlot, signal)
        if (!uploadId) return
        if (!confirm) {
          update(upload.id, { status: 'uploaded' })
          return
        }

        update(upload.id, { status: 'confirming' })
        await confirm(uploadId, signal)
        remove(upload.id)
        return
      } catch (error) {
        if (signal.aborted) return
        const { reupload, ...failure } = toFailure(error)
        if (reupload) uploadId = undefined
        if (!failure.retryable || attempt === RETRY_DELAYS.length) {
          update(upload.id, { status: 'failed', uploadId, ...failure })
          return
        }
        update(upload.id, { status: 'retrying', uploadId, progress: 0 })
        await wait(RETRY_DELAYS[attempt])
      }
    }
  }

  async function run(batch: PhotoUpload[]) {
    const { signal } = controller.current
    const type = await pickPhotoType()
    const slots: ProofPhotoUpload[] = []
    let refill: Promise<void> | undefined
    const uploadsNeedingSlots = new Set(
      batch.filter(({ uploadId }) => !uploadId),
    )

    async function takeSlot(upload: PhotoUpload) {
      uploadsNeedingSlots.add(upload)
      let slot = slots.shift()
      while (!slot) {
        refill ??= createUploads(
          {
            count: Math.min(UPLOADS_PER_REQUEST, uploadsNeedingSlots.size),
            contentType: type,
          },
          signal,
        )
          .then((items) => {
            slots.push(...items)
          })
          .finally(() => {
            refill = undefined
          })
        await refill
        slot = slots.shift()
      }
      uploadsNeedingSlots.delete(upload)
      return slot
    }

    await runPool(batch, async (upload) => {
      await process(upload, type, () => takeSlot(upload), signal)
      uploadsNeedingSlots.delete(upload)
    })
    onFinish?.()
  }

  function start(files: File[]) {
    const added = files.map((file): PhotoUpload => ({
      id: nextId.current++,
      file,
      status: 'waiting',
      progress: 0,
    }))
    setUploads((prev) => [...prev, ...added])
    void run(added)
  }

  function retry(batch: PhotoUpload[]) {
    const retryable = batch.filter((upload) => upload.retryable)
    for (const { id } of retryable) {
      update(id, { status: 'waiting', progress: 0, error: undefined })
    }
    void run(retryable)
  }

  function expire() {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.status === 'uploaded'
          ? {
              ...upload,
              status: 'failed',
              uploadId: undefined,
              error: '다시 올려 주세요',
              retryable: true,
            }
          : upload,
      ),
    )
  }

  return { uploads, isUploading, failed, start, retry, remove, expire }
}
