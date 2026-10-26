import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { signup } from '@/features/auth/api'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'
import { useSignup } from '@/features/auth/hooks/useSignup'
import { PASSWORD_RULE_MESSAGE } from '@/features/auth/lib/validation'
import { ApiError } from '@/lib/api-error'

const toastError = vi.hoisted(() => vi.fn())

vi.mock('sonner', () => ({ toast: { error: toastError } }))

vi.mock('@/features/auth/api', () => ({ signup: vi.fn() }))

const user: Me = {
  id: 'user-1',
  role: 'CUSTOMER',
  name: '김고객',
  email: 'customer@example.com',
  phone: '01012345678',
  hasProfile: false,
  customerProfile: null,
  moverProfile: null,
}

const body = {
  role: 'CUSTOMER' as const,
  name: '김고객',
  email: 'customer@example.com',
  phone: '01012345678',
  password: 'moving1!',
}

function createApiError(status: number, fields: string[] = []) {
  const details = fields.map((field) => ({ field, reason: 'INVALID' }))
  return new ApiError('UNKNOWN_ERROR', 'Request failed', status, details)
}

function renderUseSignup() {
  const onFieldErrors = vi.fn()
  const queryClient = new QueryClient()
  queryClient.setQueryData(meQueryKey, null)

  const { result } = renderHook(() => useSignup(onFieldErrors), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, onFieldErrors }
}

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('가입하면 세션을 시작한다', async () => {
    vi.mocked(signup).mockResolvedValue(user)
    const { result, queryClient } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(meQueryKey)).toEqual(user)
  })

  it('서버가 알려 준 입력란에만 오류를 표시하고 모르는 필드는 무시한다', async () => {
    vi.mocked(signup).mockRejectedValue(
      createApiError(400, ['email', 'password', 'role', 'unknown']),
    )
    const { result, onFieldErrors } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        email: '이미 가입된 이메일입니다.',
        password: PASSWORD_RULE_MESSAGE,
      }),
    )
    expect(toastError).not.toHaveBeenCalled()
  })

  it.each([
    ['알 수 없는 입력란', createApiError(500, ['unknown'])],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('입력란 오류로 표시할 수 없는 실패(%s)는 알린다', async (_name, error) => {
    vi.mocked(signup).mockRejectedValue(error)
    const { result, onFieldErrors } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(TOAST_MESSAGES.auth.signupFailed),
    )
    expect(onFieldErrors).not.toHaveBeenCalled()
  })
})
