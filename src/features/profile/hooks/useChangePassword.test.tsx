import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { handleUnauthorized } from '@/features/auth/lib/session'
import { changePassword } from '@/features/profile/api'
import { useChangePassword } from '@/features/profile/hooks/useChangePassword'
import { ApiError } from '@/lib/api-error'
import QueryProvider from '@/providers/QueryProvider'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('next/navigation', () => ({ useRouter: () => ({}) }))

vi.mock('@/features/auth/lib/session', () => ({ handleUnauthorized: vi.fn() }))

vi.mock('@/features/profile/api', () => ({ changePassword: vi.fn() }))

const body = {
  currentPassword: 'oldpass1!',
  newPassword: 'newpass1!',
  confirmPassword: 'newpass1!',
}

function renderUseChangePassword() {
  const onFieldErrors = vi.fn()

  const { result } = renderHook(() => useChangePassword(onFieldErrors), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryProvider>{children}</QueryProvider>
    ),
  })

  return { result, onFieldErrors }
}

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('비밀번호를 바꾸면 알린다', async () => {
    vi.mocked(changePassword).mockResolvedValue()
    const { result } = renderUseChangePassword()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(changePassword).toHaveBeenCalledWith(body, expect.anything())
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.profile.passwordChangeSuccess,
    )
  })

  it('현재 비밀번호가 틀리면 로그아웃하지 않고 입력란에 표시한다', async () => {
    vi.mocked(changePassword).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 'Unauthorized', 401),
    )
    const { result, onFieldErrors } = renderUseChangePassword()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(onFieldErrors).toHaveBeenCalledWith({
      currentPassword: '현재 비밀번호가 올바르지 않습니다.',
    })
    expect(handleUnauthorized).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('세션이 만료되면 로그인 만료 처리를 한 번만 한다', async () => {
    vi.mocked(changePassword).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result, onFieldErrors } = renderUseChangePassword()

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(handleUnauthorized).toHaveBeenCalledTimes(1)
    expect(onFieldErrors).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 알린다', async (_name, error) => {
    vi.mocked(changePassword).mockRejectedValue(error)
    const { result, onFieldErrors } = renderUseChangePassword()

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.profile.passwordChangeFailed,
      ),
    )
    expect(onFieldErrors).not.toHaveBeenCalled()
  })
})
