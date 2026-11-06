import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SocialLoginCallback from '@/components/auth/SocialLoginCallback'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { saveSocialLoginState } from '@/features/auth/lib/social'
import { queryKeys } from '@/lib/queryKeys'
import type { Me, Role } from '@/features/auth/types'

const mocks = vi.hoisted(() => ({ replace: vi.fn(), toastError: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }))

vi.mock('@/features/auth/api', () => ({
  getMe: vi.fn(() => new Promise(() => {})),
}))

function createUser(role: Role, hasProfile = true): Me {
  return {
    id: 'user-1',
    role,
    name: null,
    email: null,
    phone: null,
    hasProfile,
    customerProfile: null,
    moverProfile: null,
  }
}

function startSocialLogin(loginUrl: string, role: Role) {
  window.history.replaceState(null, '', loginUrl)
  saveSocialLoginState(role)
}

function renderCallback(query: string, user?: Me | null) {
  window.history.replaceState(null, '', `/oauth/callback?${query}`)

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  if (user !== undefined) queryClient.setQueryData(queryKeys.user.me(), user)

  render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SocialLoginCallback />
      </QueryClientProvider>
    </StrictMode>,
  )

  return queryClient
}

const SUCCESS = 'provider=kakao&status=success'
const ERROR = 'provider=kakao&status=error&code=SOCIAL_LOGIN_FAILED'

describe('SocialLoginCallback', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mocks.replace.mockClear()
    mocks.toastError.mockClear()
  })

  it('로그인되면 로그인 전에 가려던 페이지로 이동한다', () => {
    startSocialLogin('/login?redirect=%2Fmovers%2F1', 'CUSTOMER')
    renderCallback(SUCCESS, createUser('CUSTOMER'))

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/movers/1')
    expect(mocks.toastError).not.toHaveBeenCalled()
    expect(sessionStorage).toHaveLength(0)
  })

  it('처음 가입한 유저는 프로필 등록 페이지로 이동한다', () => {
    startSocialLogin('/mover/login', 'MOVER')
    renderCallback(SUCCESS, createUser('MOVER', false))

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith(
      '/mover/profile/register',
    )
  })

  it('내 정보를 불러오는 동안 기다렸다가 이동한다', async () => {
    startSocialLogin('/login', 'CUSTOMER')
    const queryClient = renderCallback(SUCCESS)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()

    act(() => {
      queryClient.setQueryData(queryKeys.user.me(), createUser('CUSTOMER'))
    })
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/request'),
    )
  })

  it.each([
    ['로그인에 실패하거나 취소하면', ERROR, undefined],
    ['성공 응답에도 로그인되지 않았으면', SUCCESS, null],
  ])('%s 시작한 로그인 페이지로 돌아가 안내한다', (_, query, user) => {
    startSocialLogin('/mover/login?redirect=%2Fmover%2Frequests', 'MOVER')
    renderCallback(query, user)

    expect(mocks.toastError).toHaveBeenCalledExactlyOnceWith(
      TOAST_MESSAGES.auth.socialLoginFailed,
    )
    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith(
      '/mover/login?redirect=%2Fmover%2Frequests',
    )
  })

  it('시작한 로그인 페이지를 알 수 없으면 일반 유저 로그인으로 돌아간다', () => {
    renderCallback(ERROR)

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/login')
  })
})
