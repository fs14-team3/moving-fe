import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { logout } from '@/features/auth/api'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'
import { useLogout } from '@/features/auth/hooks/useLogout'

const mocks = vi.hoisted(() => ({ replace: vi.fn(), toastError: vi.fn() }))

vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }))

vi.mock('@/features/auth/api', () => ({ logout: vi.fn() }))

const user: Me = {
  id: 'user-1',
  role: 'CUSTOMER',
  name: '김고객',
  email: 'customer@example.com',
  phone: '01012345678',
  hasProfile: true,
  customerProfile: null,
  moverProfile: null,
}

function renderUseLogout() {
  const queryClient = new QueryClient()
  queryClient.setQueryData(meQueryKey, user)

  const { result } = renderHook(() => useLogout(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient }
}

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('location', { replace: mocks.replace })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('로그아웃하면 홈을 새로 불러와 이전 세션의 화면과 캐시를 모두 버린다', async () => {
    vi.mocked(logout).mockResolvedValue()
    const { result } = renderUseLogout()

    act(() => result.current.mutate())

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/'))
  })

  it('로그아웃에 실패하면 알리고 로그인 상태를 유지한다', async () => {
    vi.mocked(logout).mockRejectedValue(new Error('Network Error'))
    const { result, queryClient } = renderUseLogout()

    act(() => result.current.mutate())

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        TOAST_MESSAGES.auth.logoutFailed,
      ),
    )
    expect(queryClient.getQueryData(meQueryKey)).toEqual(user)
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
