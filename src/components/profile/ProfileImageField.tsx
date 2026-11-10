'use client'

import { ImageIcon, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useId, useState, type ChangeEvent } from 'react'
import ProfileField from '@/components/profile/ProfileField'
import { useUploadImage } from '@/features/profile/hooks/useUploadImage'
import { getImageUploadError } from '@/features/profile/lib/errors'
import {
  IMAGE_FILE_TYPES,
  getImageFileError,
} from '@/features/profile/lib/validation'

type ProfileImageFieldProps = {
  imageUrl: string | null
  error?: string
  onChange: (imageUrl: string) => void
  onUploadingChange: (isUploading: boolean) => void
}

export default function ProfileImageField({
  imageUrl,
  error,
  onChange,
  onUploadingChange,
}: ProfileImageFieldProps) {
  const inputId = useId()
  const messageId = useId()
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string>()
  const upload = useUploadImage()

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const select = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const nextFileError = getImageFileError(file)
    setFileError(nextFileError)
    if (nextFileError) return
    setPreview(URL.createObjectURL(file))
    onUploadingChange(true)
    upload.mutate(file, {
      onSuccess: (url) => onChange(url),
      onSettled: () => onUploadingChange(false),
    })
  }

  const src = upload.isError ? imageUrl : (preview ?? imageUrl)
  const message =
    fileError ?? (upload.isError ? getImageUploadError(upload.error) : error)

  return (
    <ProfileField
      label="프로필 이미지"
      htmlFor={inputId}
      message={
        message && (
          <p
            id={messageId}
            className="mt-2 pl-2 text-xs font-medium text-red-500 lg:text-base"
          >
            <span aria-hidden="true">* </span>
            {message}
          </p>
        )
      }
    >
      <input
        id={inputId}
        type="file"
        accept={IMAGE_FILE_TYPES.join(',')}
        aria-describedby={message ? messageId : undefined}
        onChange={select}
        className="peer sr-only"
      />
      <label
        htmlFor={inputId}
        className="relative flex size-25 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-background-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-400 peer-disabled:cursor-not-allowed lg:size-40 lg:rounded-lg"
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 1200px) 160px, 100px"
            unoptimized={src.startsWith('blob:')}
            className="object-cover"
          />
        ) : (
          <ImageIcon
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-8 text-gray-400 lg:size-12"
          />
        )}
        {upload.isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black-500/50">
            <LoaderCircle
              aria-hidden="true"
              className="size-6 animate-spin text-gray-50 lg:size-8"
            />
            <span className="sr-only">이미지를 올리는 중</span>
          </span>
        )}
      </label>
    </ProfileField>
  )
}
