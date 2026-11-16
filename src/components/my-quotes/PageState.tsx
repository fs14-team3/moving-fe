import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import Button from '@/components/common/button/Button'
import { CONTAINER } from '@/components/my-quotes/container'
import { cn } from '@/lib/cn'

// 탭 아래를 회색 배경으로 채운다.
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 bg-background-200">
      <div className={cn(CONTAINER, 'pt-6 pb-20 lg:pt-10')}>{children}</div>
    </div>
  )
}

export function Loading({
  label,
  fullPage = false,
}: {
  label: string
  fullPage?: boolean
}) {
  return (
    <div
      role="status"
      className={
        fullPage
          ? 'flex min-h-page flex-col items-center justify-center gap-4'
          : 'flex justify-center py-10'
      }
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span
        className={fullPage ? 'text-base text-gray-400 md:text-lg' : 'sr-only'}
      >
        {label}
      </span>
    </div>
  )
}

export function LoadError({
  message,
  onRetry,
  isRetrying = false,
  fullPage = false,
}: {
  message: string
  onRetry: () => void
  isRetrying?: boolean
  fullPage?: boolean
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-6',
        fullPage ? 'min-h-page justify-center' : 'py-20',
      )}
    >
      <p className="text-base font-semibold text-black-400 lg:text-lg">
        {message}
      </p>
      <Button
        variant="outlined"
        disabled={isRetrying}
        onClick={onRetry}
        className="w-auto px-8 lg:w-auto"
      >
        다시 시도
      </Button>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center lg:py-32">
      <Image
        src="/assets/images/truck.webp"
        alt=""
        width={870}
        height={658}
        className="h-auto w-45 opacity-40 grayscale md:w-60"
      />
      {children}
    </div>
  )
}
