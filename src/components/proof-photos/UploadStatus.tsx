import type { ReactNode } from 'react'
import type { PhotoUpload } from '@/features/proof-photos/hooks/usePhotoUploads'

type UploadStatusProps = {
  uploadingCount: number
  failed: PhotoUpload[]
  onRetry: (failed: PhotoUpload[]) => void
  children?: ReactNode
}

export default function UploadStatus({
  uploadingCount,
  failed,
  onRetry,
  children,
}: UploadStatusProps) {
  const isUploading = uploadingCount > 0

  return (
    <div aria-live="polite" className="flex items-center justify-between gap-3">
      {isUploading && (
        <p className="pb-3 text-sm font-medium text-black-200 md:text-base">
          {uploadingCount}장을 올리고 있어요.
        </p>
      )}
      {!isUploading && failed.length === 0 && children}
      {!isUploading && failed.length > 0 && (
        <>
          <p className="pb-3 text-sm font-medium text-red-500 md:text-base">
            {failed.length}장을 올리지 못했어요.
          </p>
          {failed.some(({ retryable }) => retryable) && (
            <button
              type="button"
              onClick={() => onRetry(failed)}
              className="cursor-pointer pb-3 text-sm font-semibold text-primary-400 md:text-base"
            >
              모두 다시 시도
            </button>
          )}
        </>
      )}
    </div>
  )
}
