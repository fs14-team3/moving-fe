import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  confirmProofPhoto,
  createProofPhotoUploads,
  uploadToStorage,
  type ProofPhoto,
  type ProofPhotoList,
  type ProofPhotoType,
} from '@/features/proof-photos/api'
import {
  pickPhotoType,
  resizeProofPhoto,
} from '@/features/proof-photos/lib/resizeProofPhoto'
import { isApiError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const CONCURRENCY = 3

export type PhotoUpload = {
  id: number
  file: File
  status: 'waiting' | 'uploading' | 'confirming' | 'failed'
  progress: number
  previewUrl?: string
  uploadId?: string
  error?: string
  retryable?: boolean
}

function toFailure(error: unknown) {
  const code = isApiError(error) ? error.code : undefined
  if (code === 'PROOF_PHOTO_LIMIT_REACHED') {
    return { error: '최대 장수를 넘었어요', retryable: false }
  }
  return {
    error: '올리지 못했어요',
    retryable: true,
    ...(code === 'PROOF_PHOTO_NOT_UPLOADED' && { uploadId: undefined }),
  }
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

export function useProofPhotoUploads(quoteId: string) {
  const queryClient = useQueryClient()
  const [uploads, setUploads] = useState<PhotoUpload[]>([])
  const nextId = useRef(0)
  const previewUrls = useRef(new Map<number, string>())
  const controller = useRef(new AbortController())

  const isUploading = uploads.some(({ status }) => status !== 'failed')
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

  async function addToList(photo: ProofPhoto) {
    const queryKey = queryKeys.proofPhotos.list(quoteId)
    await queryClient.cancelQueries({ queryKey })
    queryClient.setQueryData<ProofPhotoList>(queryKey, (list) =>
      list && !list.items.some(({ id }) => id === photo.id)
        ? { ...list, items: [...list.items, photo] }
        : list,
    )
  }

  async function sendToStorage(
    { id, file }: PhotoUpload,
    type: ProofPhotoType,
    signal: AbortSignal,
  ) {
    let resized
    try {
      resized = await resizeProofPhoto(file, type)
    } catch {
      update(id, {
        status: 'failed',
        error: '사진을 열 수 없어요',
        retryable: false,
      })
      return
    }
    const { image, thumbnail } = resized

    if (!previewUrls.current.has(id)) {
      previewUrls.current.set(id, URL.createObjectURL(thumbnail))
    }
    update(id, { previewUrl: previewUrls.current.get(id) })
    const [presigned] = await createProofPhotoUploads(
      quoteId,
      { count: 1, contentType: type },
      signal,
    )
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
    await Promise.all([
      uploadToStorage(presigned.image, image, report(0), signal),
      uploadToStorage(presigned.thumbnail, thumbnail, report(1), signal),
    ])
    update(id, { uploadId: presigned.uploadId, progress: 100 })
    return presigned.uploadId
  }

  async function process(
    upload: PhotoUpload,
    type: ProofPhotoType,
    signal: AbortSignal,
  ) {
    try {
      const uploadId =
        upload.uploadId ?? (await sendToStorage(upload, type, signal))
      if (!uploadId) return

      update(upload.id, { status: 'confirming' })
      await addToList(await confirmProofPhoto(quoteId, uploadId, signal))
      remove(upload.id)
    } catch (error) {
      if (signal.aborted) return
      update(upload.id, { status: 'failed', ...toFailure(error) })
    }
  }

  async function run(batch: PhotoUpload[]) {
    const { signal } = controller.current
    const type = await pickPhotoType()
    await runPool(batch, (upload) => process(upload, type, signal))
    void queryClient.invalidateQueries({
      queryKey: queryKeys.proofPhotos.list(quoteId),
    })
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

  return {
    uploads,
    isUploading,
    failed,
    start,
    retry,
    remove,
  }
}
