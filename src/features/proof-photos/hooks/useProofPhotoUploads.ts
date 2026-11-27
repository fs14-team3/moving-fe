import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  confirmProofPhoto,
  createProofPhotoUploads,
  type ProofPhoto,
  type ProofPhotoList,
} from '@/features/proof-photos/api'
import { usePhotoUploads } from '@/features/proof-photos/hooks/usePhotoUploads'
import { isApiError, isClientError } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const DONE_MESSAGE_MS = 4000

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
    reupload: isNotUploaded(error),
  }
}

export function useProofPhotoUploads(quoteId: string) {
  const queryClient = useQueryClient()
  const [uploadedIds, setUploadedIds] = useState<string[]>([])
  const queryKey = queryKeys.proofPhotos.list(quoteId)

  async function addToList(photo: ProofPhoto) {
    await queryClient.cancelQueries({ queryKey })
    queryClient.setQueryData<ProofPhotoList>(queryKey, (list) =>
      list && !list.items.some(({ id }) => id === photo.id)
        ? { ...list, items: [...list.items, photo] }
        : list,
    )
  }

  const { uploads, isUploading, failed, start, retry, remove } =
    usePhotoUploads({
      createUploads: (body, signal) =>
        createProofPhotoUploads(quoteId, body, signal),
      confirm: async (uploadId, signal) => {
        const photo = await confirmProofPhoto(quoteId, uploadId, signal)
        setUploadedIds((prev) => [...prev, photo.id])
        await addToList(photo)
      },
      toFailure,
      onFinish: () => void queryClient.invalidateQueries({ queryKey }),
    })

  useEffect(() => {
    if (isUploading || uploadedIds.length === 0) return
    const timer = setTimeout(() => setUploadedIds([]), DONE_MESSAGE_MS)
    return () => clearTimeout(timer)
  }, [isUploading, uploadedIds.length])

  return {
    uploads,
    uploadedIds,
    isUploading,
    failed,
    start: (files: File[]) => {
      setUploadedIds([])
      start(files)
    },
    retry,
    remove,
  }
}
