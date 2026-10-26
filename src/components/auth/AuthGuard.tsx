'use client'

import { LoaderCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import Button from '@/components/common/Button'
import { canAccess, getRouteAccess } from '@/features/auth/lib/access'
import { getRedirectPath } from '@/features/auth/lib/paths'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

type SessionErrorProps = {
  isRetrying: boolean
  onRetry: () => void
}

function SessionError({ isRetrying, onRetry }: SessionErrorProps) {
  return (
    <div
      role="alert"
      className="flex min-h-page flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p className="text-lg font-semibold text-black-400">
        로그인 정보를 불러오지 못했습니다.
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

function SessionPending() {
  return (
    <div role="status" className="flex min-h-page items-center justify-center">
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span className="sr-only">로그인 정보를 확인하고 있습니다.</span>
    </div>
  )
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isPending, isError, isRefetching, refetch } = useCurrentUser()
  const access = getRouteAccess(pathname)
  const isBlocked = !isPending && !isError && !canAccess(access, user)

  useEffect(() => {
    if (!isBlocked) return
    const redirectPath = getRedirectPath(access, user)
    if (redirectPath) router.replace(redirectPath)
  }, [isBlocked, access, user, router])

  if (access === 'PUBLIC') return children
  if (isError) {
    return <SessionError isRetrying={isRefetching} onRetry={() => refetch()} />
  }
  if (isPending || isBlocked) return <SessionPending />
  return children
}
