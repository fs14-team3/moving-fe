import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { queryKeys } from '@/lib/queryKeys'
import type { Me } from '@/features/auth/types'
import { updateBasicInfo } from '@/features/profile/api'
import { useUpdateBasicInfo } from '@/features/profile/hooks/useUpdateBasicInfo'
import { ApiError } from '@/lib/api-error'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/profile/api', () => ({ updateBasicInfo: vi.fn() }))

const me: Me = {
  id: 'user-1',
  role: 'MOVER',
  name: '김기사',
  email: 'mover@example.com',
  phone: '01012345678',
  hasProfile: true,
  isProfileComplete: true,
  customerProfile: null,
  moverProfile: null,
}

function renderUseUpdateBasicInfo() {
  const onFieldErrors = vi.fn()
  const queryClient = new QueryClient()
  queryClient.setQueryData(queryKeys.user.me(), me)

  const { result } = renderHook(() => useUpdateBasicInfo(onFieldErrors), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, onFieldErrors }
}

describe('useUpdateBasicInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('수정하면 받은 내 정보로 바꾸고 알린다', async () => {
    const updated = { ...me, name: '김코드' }
    vi.mocked(updateBasicInfo).mockResolvedValue(updated)
    const { result, queryClient } = renderUseUpdateBasicInfo()

    act(() => result.current.mutate({ name: '김코드' }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateBasicInfo).toHaveBeenCalledWith(
      { name: '김코드' },
      expect.anything(),
    )
    expect(queryClient.getQueryData(queryKeys.user.me())).toEqual(updated)
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.profile.basicInfoUpdateSuccess,
    )
  })

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(updateBasicInfo).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseUpdateBasicInfo()

    act(() => result.current.mutate({ name: '김코드' }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('서버가 알려 준 입력란에 첫 번째 사유를 표시하고 모르는 필드는 무시한다', async () => {
    vi.mocked(updateBasicInfo).mockRejectedValue(
      new ApiError('VALIDATION_ERROR', 'Bad Request', 400, [
        { field: 'name', reason: '이름은 20자 이하여야 합니다' },
        { field: 'email', reason: '올바른 이메일 형식이 아닙니다' },
        { field: 'email', reason: '이메일은 255자 이하여야 합니다' },
        { field: 'unknown', reason: '알 수 없는 입력입니다' },
      ]),
    )
    const { result, onFieldErrors } = renderUseUpdateBasicInfo()

    act(() => result.current.mutate({ email: 'new@example.com' }))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        name: '이름은 20자 이하여야 합니다',
        email: '올바른 이메일 형식이 아닙니다',
      }),
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('사유가 비어 있으면 입력란별 기본 안내를 보여 준다', async () => {
    vi.mocked(updateBasicInfo).mockRejectedValue(
      new ApiError('VALIDATION_ERROR', 'Bad Request', 400, [
        { field: 'email', reason: '' },
        { field: 'currentPassword', reason: '' },
      ]),
    )
    const { result, onFieldErrors } = renderUseUpdateBasicInfo()

    act(() => result.current.mutate({ email: 'new@example.com' }))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        email: '이메일을 다시 확인해 주세요.',
        currentPassword: '현재 비밀번호를 다시 확인해 주세요.',
      }),
    )
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])(
    '그 밖의 실패(%s)는 알리고 내 정보를 바꾸지 않는다',
    async (_name, error) => {
      vi.mocked(updateBasicInfo).mockRejectedValue(error)
      const { result, queryClient, onFieldErrors } = renderUseUpdateBasicInfo()

      act(() => result.current.mutate({ name: '김코드' }))

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          TOAST_MESSAGES.profile.basicInfoUpdateFailed,
        ),
      )
      expect(onFieldErrors).not.toHaveBeenCalled()
      expect(queryClient.getQueryData(queryKeys.user.me())).toEqual(me)
    },
  )
})
