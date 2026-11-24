import { LoaderCircle, RotateCw, X } from 'lucide-react'
import Image from 'next/image'
import type { PhotoUpload } from '@/features/proof-photos/hooks/usePhotoUploads'

type UploadTileProps = {
  upload: PhotoUpload
  disabled: boolean
  onRetry: () => void
  onRemove: () => void
}

const OUTLINE = {
  x: 1.5,
  y: 1.5,
  width: 97,
  height: 97,
  rx: 7,
  fill: 'none',
  strokeWidth: 3,
  vectorEffect: 'non-scaling-stroke',
} as const

const STATUS_LABEL: Partial<Record<PhotoUpload['status'], string>> = {
  waiting: '올릴 준비 중',
  confirming: '저장하는 중',
  retrying: '다시 시도하는 중',
}

function ProgressOutline({ progress }: { progress: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <rect {...OUTLINE} className="stroke-gray-50/40" />
      <rect
        {...OUTLINE}
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - progress}
        className="stroke-primary-400 transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  )
}

function Status({ upload }: { upload: PhotoUpload }) {
  if (upload.status === 'uploading') {
    return (
      <p className="text-sm font-semibold">
        <span className="sr-only">올리는 중 </span>
        {upload.progress}%
      </p>
    )
  }

  const isRetrying = upload.status === 'retrying'

  return (
    <div className="flex flex-col items-center gap-1">
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
      <span className={isRetrying ? 'text-xs font-medium' : 'sr-only'}>
        {STATUS_LABEL[upload.status]}
      </span>
    </div>
  )
}

export default function UploadTile({
  upload,
  disabled,
  onRetry,
  onRemove,
}: UploadTileProps) {
  const isFailed = upload.status === 'failed'

  return (
    <li className="relative aspect-square overflow-hidden rounded-lg bg-background-300">
      {upload.previewUrl && (
        <Image
          src={upload.previewUrl}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
      )}

      <div
        className={
          isFailed
            ? 'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black-500/60 px-2 text-gray-50'
            : 'absolute inset-0 flex items-center justify-center bg-black-500/40 text-gray-50'
        }
      >
        {isFailed ? (
          <>
            <p role="alert" className="text-center text-xs font-medium">
              {upload.error}
            </p>
            {upload.retryable && (
              <button
                type="button"
                disabled={disabled}
                onClick={onRetry}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-black-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCw aria-hidden="true" className="size-3" />
                다시 시도
              </button>
            )}
          </>
        ) : (
          <Status upload={upload} />
        )}
      </div>

      {isFailed ? (
        <button
          type="button"
          aria-label="목록에서 빼기"
          onClick={onRemove}
          className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black-500/60 text-gray-50"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : (
        <ProgressOutline progress={upload.progress} />
      )}
    </li>
  )
}
