'use client'

import { Check, CircleCheck, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import { useId, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import Button from '@/components/common/button/Button'
import ConfirmModal from '@/components/common/modal/ConfirmModal'
import { LoadError, Loading } from '@/components/my-quotes/PageState'
import ProofPhotoViewer from '@/components/proof-photos/ProofPhotoViewer'
import UploadTile from '@/components/proof-photos/UploadTile'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useDeleteProofPhoto } from '@/features/proof-photos/hooks/useDeleteProofPhoto'
import { useProofPhotoUploads } from '@/features/proof-photos/hooks/useProofPhotoUploads'
import { useProofPhotos } from '@/features/proof-photos/hooks/useProofPhotos'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'
import { cn } from '@/lib/cn'

function UploadedMark() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex animate-upload-done items-center justify-center bg-black-500/40"
    >
      <span className="flex size-10 animate-upload-check items-center justify-center rounded-full bg-primary-400 text-gray-50 motion-reduce:animate-none">
        <Check strokeWidth={3} className="size-6" />
      </span>
    </span>
  )
}

type ProofPhotoSectionProps = {
  quoteId: string
  emptyMessage: string
  className?: string
}

export default function ProofPhotoSection({
  quoteId,
  emptyMessage,
  className,
}: ProofPhotoSectionProps) {
  const headingId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<File[]>([])
  const [viewing, setViewing] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const {
    photos,
    maxCount,
    canEdit,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  } = useProofPhotos(quoteId)
  const { uploads, uploadedIds, isUploading, failed, start, retry, remove } =
    useProofPhotoUploads(quoteId)
  const { mutate: deletePhoto, isPending: isDeleting } =
    useDeleteProofPhoto(quoteId)

  const remaining = maxCount - photos.length - uploads.length
  const hasRetryable = failed.some(({ retryable }) => retryable)
  const canRetry = !isUploading && hasRetryable
  const leaveGuard = useLeaveGuard(
    selected.length > 0 || isUploading || hasRetryable,
  )

  function select(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return
    if (files.length > remaining) {
      toast.error(TOAST_MESSAGES.proofPhoto.tooMany(remaining))
      return
    }
    setSelected(files)
  }

  function upload() {
    start(selected)
    setSelected([])
  }

  function confirmDelete() {
    if (deletingId === null) return
    const lastIndex = photos.length - 2
    deletePhoto(deletingId, {
      onSuccess: () =>
        setViewing((index) =>
          index === null || lastIndex < 0 ? null : Math.min(index, lastIndex),
        ),
      onSettled: () => setDeletingId(null),
    })
  }

  function renderBody() {
    if (isPending) return <Loading label="작업 사진을 불러오고 있습니다." />

    if (isLoadingError) {
      return (
        <LoadError
          message="작업 사진을 불러오지 못했습니다."
          isRetrying={isRefetching}
          onRetry={() => refetch()}
        />
      )
    }

    if (photos.length === 0 && uploads.length === 0) {
      return (
        <p className="text-base leading-6 text-gray-400">
          {canEdit ? '이사 현장 사진을 올려 주세요.' : emptyMessage}
        </p>
      )
    }

    return (
      <ul className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-5">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-background-300"
          >
            <button
              type="button"
              aria-label={`작업 사진 ${index + 1} 크게 보기`}
              onClick={() => setViewing(index)}
              className="relative size-full cursor-pointer"
            >
              <Image
                src={photo.thumbnailUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </button>
            {uploadedIds.includes(photo.id) && <UploadedMark />}
          </li>
        ))}
        {uploads.map((upload) => (
          <UploadTile
            key={upload.id}
            upload={upload}
            disabled={isUploading}
            onRetry={() => retry([upload])}
            onRemove={() => remove(upload.id)}
          />
        ))}
      </ul>
    )
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn('py-5 md:py-8', className)}
    >
      <div className="flex items-center justify-between gap-3 pb-5 md:pb-8">
        <div className="flex items-center gap-2">
          <h2
            id={headingId}
            className="text-base leading-6 font-semibold md:text-xl md:leading-8"
          >
            작업 사진
          </h2>
          {!isPending && !isLoadingError && (
            <p className="text-sm font-medium text-gray-400 md:text-base">
              {photos.length}/{maxCount}
            </p>
          )}
        </div>

        {canEdit && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={select}
            />
            <Button
              variant="outlined"
              disabled={
                isPending || isLoadingError || isUploading || remaining <= 0
              }
              onClick={() => inputRef.current?.click()}
              icon={<ImagePlus aria-hidden="true" className="size-4" />}
              className="h-10 w-auto gap-1 rounded-xl px-4 text-sm lg:h-11 lg:w-auto lg:text-base"
            >
              사진 올리기
            </Button>
          </>
        )}
      </div>

      <div
        aria-live="polite"
        className="flex items-center justify-between gap-3"
      >
        {isUploading && (
          <p className="pb-3 text-sm font-medium text-black-200 md:text-base">
            {uploads.length - failed.length}장을 올리고 있어요.
          </p>
        )}
        {!isUploading && failed.length === 0 && uploadedIds.length > 0 && (
          <p className="flex items-center gap-1 pb-3 text-sm font-medium text-primary-400 md:text-base">
            <CircleCheck aria-hidden="true" className="size-4 md:size-5" />
            {uploadedIds.length}장을 올렸어요.
          </p>
        )}
        {!isUploading && failed.length > 0 && (
          <>
            <p className="pb-3 text-sm font-medium text-red-500 md:text-base">
              {failed.length}장을 올리지 못했어요.
            </p>
            {canRetry && (
              <button
                type="button"
                onClick={() => retry(failed)}
                className="cursor-pointer pb-3 text-sm font-semibold text-primary-400 md:text-base"
              >
                모두 다시 시도
              </button>
            )}
          </>
        )}
      </div>

      {isRefetchError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 pb-3"
        >
          <p className="text-sm font-medium text-red-500 md:text-base">
            작업 사진을 새로 불러오지 못했어요.
          </p>
          <button
            type="button"
            disabled={isRefetching}
            onClick={() => refetch()}
            className="cursor-pointer text-sm font-semibold text-primary-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
          >
            다시 불러오기
          </button>
        </div>
      )}

      {renderBody()}

      <ConfirmModal
        open={selected.length > 0}
        onClose={() => setSelected([])}
        onConfirm={upload}
        title="작업 사진 올리기"
        confirmLabel="올리기"
      >
        {selected.length}장을 올릴까요?
        <br />
        고객님이 리뷰를 작성하면 올리거나 삭제할 수 없어요.
      </ConfirmModal>

      <ConfirmModal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="작업 사진 삭제"
        confirmLabel="삭제하기"
        isPending={isDeleting}
      >
        이 사진을 삭제할까요?
        <br />
        삭제한 사진은 되돌릴 수 없어요.
      </ConfirmModal>

      <ConfirmModal
        open={leaveGuard.isOpen}
        onClose={leaveGuard.stay}
        onConfirm={leaveGuard.leave}
        title="페이지를 나갈까요?"
        confirmLabel="나가기"
      >
        아직 올리지 못한 사진이 있어요.
        <br />
        나가면 사진을 다시 선택해야 해요.
      </ConfirmModal>

      <ProofPhotoViewer
        photos={photos}
        index={viewing}
        onChange={setViewing}
        onClose={() => setViewing(null)}
        onDelete={canEdit ? (photo) => setDeletingId(photo.id) : undefined}
      />
    </section>
  )
}
