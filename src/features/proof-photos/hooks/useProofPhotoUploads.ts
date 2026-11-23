import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  confirmProofPhoto,
  createProofPhotoUploads,
  uploadToStorage,
  type ProofPhoto,
  type ProofPhotoList,
  type ProofPhotoType,
  type ProofPhotoUpload,
} from '@/features/proof-photos/api'
import {
  pickPhotoType,
  resizeProofPhoto,
} from '@/features/proof-photos/lib/resizeProofPhoto'
import { isApiError, isClientError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const CONCURRENCY = 3
const UPLOADS_PER_REQUEST = 10
const RETRY_DELAYS = [1000, 3000]
const DONE_MESSAGE_MS = 4000

export type PhotoUpload = {
  id: number
  file: File
  status: 'waiting' | 'uploading' | 'confirming' | 'retrying' | 'failed'
  progress: number
  previewUrl?: string
  uploadId?: string
  error?: string
  retryable?: boolean
}

function isNotUploaded(error: unknown) {
  return isApiError(error) && error.code === 'PROOF_PHOTO_NOT_UPLOADED'
}

function toFailure(error: unknown) {
  if (isApiError(error) && error.code === 'PROOF_PHOTO_LIMIT_REACHED') {
    return { error: '최대 장수를 넘었어요', retryable: false }
  }
  if (isApiError(error) && error.code === 'PROOF_PHOTO_REVIEWED') {
    return { error: '리뷰가 작성되어 올릴 수 없어요', retryable: false }
  }
  if (isApiError(error) && error.code === 'PROOF_PHOTO_DELETED') {
    return { error: '삭제된 사진이에요', retryable: false }
  }
  return {
    error: '올리지 못했어요',
    retryable: !isClientError(error) || isNotUploaded(error),
  }
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

export function useProofPhotoUploads(quoteId: string) {
  const queryClient = useQueryClient()
  const [uploads, setUploads] = useState<PhotoUpload[]>([])
  const [uploadedIds, setUploadedIds] = useState<string[]>([])
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

  useEffect(() => {
    if (isUploading || uploadedIds.length === 0) return
    const timer = setTimeout(() => setUploadedIds([]), DONE_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [isUploading, uploadedIds.length])

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
    takeSlot: () => Promise<ProofPhotoUpload>,
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
    const presigned = await takeSlot()
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
    takeSlot: () => Promise<ProofPhotoUpload>,
    signal: AbortSignal,
  ) {
    let { uploadId } = upload
    for (let attempt = 0; !signal.aborted; attempt++) {
      try {
        uploadId ??= await sendToStorage(upload, type, takeSlot, signal)
        if (!uploadId) return

        update(upload.id, { status: 'confirming' })
        const photo = await confirmProofPhoto(quoteId, uploadId, signal)
        setUploadedIds((prev) => [...prev, photo.id])
        await addToList(photo)
        remove(upload.id)
        return
      } catch (error) {
        if (signal.aborted) return
        if (isNotUploaded(error)) uploadId = undefined
        const failure = toFailure(error)
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
        refill ??= createProofPhotoUploads(
          quoteId,
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
    setUploadedIds([])
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
    uploadedIds,
    isUploading,
    failed,
    start,
    retry,
    remove,
  }
}
