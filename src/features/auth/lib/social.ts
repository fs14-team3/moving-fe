import { getRedirectParam } from '@/features/auth/lib/paths'
import type { Role } from '@/features/auth/types'

const STORAGE_KEY = 'socialLogin'

type SocialLoginState = {
  role: Role
  redirect: string | null
}

export function saveSocialLoginState(role: Role) {
  const state: SocialLoginState = { role, redirect: getRedirectParam() }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

export function takeSocialLoginState(): SocialLoginState {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    const { role, redirect } = JSON.parse(saved ?? '{}')
    return {
      role: role === 'MOVER' ? 'MOVER' : 'CUSTOMER',
      redirect: typeof redirect === 'string' ? redirect : null,
    }
  } catch {
    return { role: 'CUSTOMER', redirect: null }
  }
}
