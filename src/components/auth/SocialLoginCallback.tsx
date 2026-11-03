'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import SessionPending from '@/components/auth/SessionPending'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import {
  getLoginPath,
  getPathAfterLogin,
  LOGIN_PATH,
} from '@/features/auth/lib/paths'
import { takeSocialLoginState } from '@/features/auth/lib/social'

export default function SocialLoginCallback() {
  const router = useRouter()
  const { user, isPending } = useCurrentUser()
  const isHandled = useRef(false)

  useEffect(() => {
    const isSuccess =
      new URLSearchParams(window.location.search).get('status') === 'success'
    if (isHandled.current || (isSuccess && isPending)) return
    isHandled.current = true

    const { role, redirect } = takeSocialLoginState()
    if (isSuccess && user) {
      router.replace(getPathAfterLogin(user, redirect))
      return
    }

    toast.error(TOAST_MESSAGES.auth.socialLoginFailed)
    router.replace(redirect ? getLoginPath(role, redirect) : LOGIN_PATH[role])
  }, [isPending, user, router])

  return <SessionPending />
}
