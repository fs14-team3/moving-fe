import Image from 'next/image'
import type { ReactNode } from 'react'

export const PHOTO_GRID =
  'grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-5'

type PhotoThumbnailProps = {
  src: string
  label: string
  onClick: () => void
  children?: ReactNode
}

export default function PhotoThumbnail({
  src,
  label,
  onClick,
  children,
}: PhotoThumbnailProps) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-lg bg-background-300">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="relative size-full cursor-pointer"
      >
        <Image src={src} alt="" fill unoptimized className="object-cover" />
      </button>
      {children}
    </li>
  )
}
