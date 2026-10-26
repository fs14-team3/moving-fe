import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { login } from '@/features/auth/api'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { ApiError } from '@/lib/api-error'

const toastError = vi.hoisted(() => vi.fn())

vi.mock('sonner', () => ({ toast: { error: toastError } }))

vi.mock('@/features/auth/api', () => ({ login: vi.fn() }))

const user: Me = {
  id: 'user-1',
  role: 'MOVER',
  name: '김기사',
  email: 'mover@example.com',
  phone: null,
  hasProfile: true,
  customerProfile: null,
  moverProfile: null,
}

const credentials = {
  role: 'MOVER' as const,
  email: 'mover@example.com',
  password: 'password1!',
}

function createApiError(status: number) {
  return new ApiError('UNKNOWN_ERROR', 'Request failed', status)
}

function renderUseLogin() {
  const queryClient = new QueryClient()
  queryClient.setQueryData(meQueryKey, null)

  const { result } = renderHook(() => useLogin(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient }
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인하면 세션을 시작한다', async () => {
    vi.mocked(login).mockResolvedValue(user)
    const { result, queryClient } = renderUseLogin()

    act(() => result.current.mutate(credentials))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(meQueryKey)).toEqual(user)
    expect(toastError).not.toHaveBeenCalled()
  })

  it.each([
    [401, TOAST_MESSAGES.auth.invalidCredentials],
    [500, TOAST_MESSAGES.auth.loginFailed],
  ])('%i 응답이면 "%s"를 알린다', async (status, message) => {
    vi.mocked(login).mockRejectedValue(createApiError(status))
    const { result, queryClient } = renderUseLogin()

    act(() => result.current.mutate(credentials))

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(message))
    expect(toastError).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(meQueryKey)).toBeNull()
  })
})
