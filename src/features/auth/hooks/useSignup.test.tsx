import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { signup } from '@/features/auth/api'
import { queryKeys } from '@/lib/queryKeys'
import type { Me } from '@/features/auth/types'
import { useSignup } from '@/features/auth/hooks/useSignup'
import { PASSWORD_RULE_MESSAGE } from '@/features/auth/lib/validation'
import { ApiError, type ApiErrorDetail } from '@/lib/api-error'

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

function createApiError(
  status: number,
  details: ApiErrorDetail[] = [],
  code = 'UNKNOWN_ERROR',
) {
  return new ApiError(code, 'Request failed', status, details)
}

function renderUseSignup() {
  const onFieldErrors = vi.fn()
  const queryClient = new QueryClient()
  queryClient.setQueryData(queryKeys.user.me(), null)

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
    expect(queryClient.getQueryData(queryKeys.user.me())).toEqual(user)
  })

  it('서버가 알려 준 입력란에 첫 번째 사유를 표시하고 모르는 필드는 무시한다', async () => {
    vi.mocked(signup).mockRejectedValue(
      createApiError(400, [
        { field: 'password', reason: '비밀번호는 16자 이하여야 합니다' },
        { field: 'password', reason: '비밀번호에 특수문자를 포함해 주세요' },
        { field: 'phone', reason: '전화번호 형식이 올바르지 않습니다' },
        { field: 'role', reason: '잘못된 회원 유형입니다' },
        { field: 'unknown', reason: '알 수 없는 입력입니다' },
      ]),
    )
    const { result, onFieldErrors } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        password: '비밀번호는 16자 이하여야 합니다',
        phone: '전화번호 형식이 올바르지 않습니다',
      }),
    )
    expect(toastError).not.toHaveBeenCalled()
  })

  it('사유가 비어 있으면 입력란별 기본 안내를 보여 준다', async () => {
    vi.mocked(signup).mockRejectedValue(
      createApiError(400, [
        { field: 'email', reason: '' },
        { field: 'password', reason: '' },
      ]),
    )
    const { result, onFieldErrors } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        email: '이메일을 다시 확인해 주세요.',
        password: PASSWORD_RULE_MESSAGE,
      }),
    )
  })

  it('이미 가입된 이메일이면 이메일 입력란에 안내한다', async () => {
    vi.mocked(signup).mockRejectedValue(
      createApiError(
        409,
        [{ field: 'email', reason: '이미 사용 중인 이메일입니다' }],
        'EMAIL_ALREADY_EXISTS',
      ),
    )
    const { result, onFieldErrors } = renderUseSignup()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        email: '이미 가입된 이메일입니다.',
      }),
    )
    expect(toastError).not.toHaveBeenCalled()
  })

  it.each([
    [
      '알 수 없는 입력란',
      createApiError(500, [{ field: 'unknown', reason: 'INVALID' }]),
    ],
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
