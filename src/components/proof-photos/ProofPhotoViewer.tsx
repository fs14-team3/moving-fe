'use client'

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'
import Button from '@/components/common/button/Button'
import Modal from '@/components/common/modal/Modal'
import type { ProofPhoto } from '@/features/proof-photos/api'
import { cn } from '@/lib/cn'

type ViewerPhoto = Pick<ProofPhoto, 'url' | 'thumbnailUrl'>

type ProofPhotoViewerProps<T extends ViewerPhoto> = {
  photos: T[]
  index: number | null
  label?: string
  keyboardDisabled?: boolean
  onChange: (index: number) => void
  onClose: () => void
  onDelete?: (photo: T) => void
}

const NAV_BUTTON =
  'absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-50/90 text-black-400 shadow-md disabled:hidden'

export default function ProofPhotoViewer<T extends ViewerPhoto>({
  photos,
  index,
  label = '작업 사진',
  keyboardDisabled = false,
  onChange,
  onClose,
  onDelete,
}: ProofPhotoViewerProps<T>) {
  const photo = index === null ? undefined : photos[index]

  useEffect(() => {
    if (index === null || keyboardDisabled) return
    const move = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && index > 0) onChange(index - 1)
      if (event.key === 'ArrowRight' && index < photos.length - 1) {
        onChange(index + 1)
      }
    }
    addEventListener('keydown', move)
    return () => removeEventListener('keydown', move)
  }, [index, keyboardDisabled, photos.length, onChange])

  return (
    <Modal open={photo !== undefined} onClose={onClose} title={label}>
      {photo && index !== null && (
        <>
          <div className="relative h-[60dvh] overflow-hidden rounded-xl bg-black-500">
            <Image
              key={photo.thumbnailUrl}
              src={photo.thumbnailUrl}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
            <Image
              key={photo.url}
              src={photo.url}
              alt={`${label} ${index + 1}`}
              fill
              unoptimized
              className="object-contain"
            />
            <button
              type="button"
              aria-label="이전 사진"
              disabled={index === 0}
              onClick={() => onChange(index - 1)}
              className={cn(NAV_BUTTON, 'left-3')}
            >
              <ChevronLeft aria-hidden="true" className="size-6" />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              disabled={index === photos.length - 1}
              onClick={() => onChange(index + 1)}
              className={cn(NAV_BUTTON, 'right-3')}
            >
              <ChevronRight aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div
            className={cn(
              'relative mt-4 flex items-center justify-center',
              onDelete && 'h-10 lg:h-11',
            )}
          >
            <p className="text-sm font-medium text-gray-500 md:text-base">
              {index + 1} / {photos.length}
            </p>
            {onDelete && (
              <Button
                variant="outlined"
                onClick={() => onDelete(photo)}
                icon={<Trash2 aria-hidden="true" className="size-4" />}
                className="absolute right-0 h-10 w-auto gap-1 rounded-xl border-red-500 px-4 text-sm text-red-500 hover:bg-red-500/10 active:bg-red-500/15 lg:h-11 lg:w-auto lg:text-base"
              >
                삭제
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
