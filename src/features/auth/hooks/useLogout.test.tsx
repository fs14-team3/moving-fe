import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { logout } from '@/features/auth/api'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'
import { useLogout } from '@/features/auth/hooks/useLogout'

const mocks = vi.hoisted(() => ({ replace: vi.fn(), toastError: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

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
  })

  it('로그아웃하면 세션을 비우고 홈으로 보낸다', async () => {
    vi.mocked(logout).mockResolvedValue()
    const { result, queryClient } = renderUseLogout()

    act(() => result.current.mutate())

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/'))
    expect(queryClient.getQueryData(meQueryKey)).toBeNull()
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
