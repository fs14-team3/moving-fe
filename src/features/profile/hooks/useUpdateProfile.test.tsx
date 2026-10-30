import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'
import { updateProfile } from '@/features/profile/api'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { ApiError } from '@/lib/api-error'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/profile/api', () => ({ updateProfile: vi.fn() }))

const savedProfile = { serviceTypes: ['SMALL' as const], regions: ['서울'] }

const body = { serviceTypes: ['HOME' as const], regions: ['부산'] }

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김가나',
    email: 'user@example.com',
    phone: '01012345678',
    hasProfile: true,
    customerProfile: role === 'CUSTOMER' ? savedProfile : null,
    moverProfile: role === 'MOVER' ? savedProfile : null,
  }
}

function renderUseUpdateProfile(role: Role) {
  const onFieldErrors = vi.fn()
  const queryClient = new QueryClient()
  queryClient.setQueryData(meQueryKey, createUser(role))

  const { result } = renderHook(() => useUpdateProfile(role, onFieldErrors), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, onFieldErrors }
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each<[Role, keyof Me]>([
    ['CUSTOMER', 'customerProfile'],
    ['MOVER', 'moverProfile'],
  ])(
    '%s 프로필을 수정하면 내 정보에 반영하고 알린다',
    async (role, profileField) => {
      vi.mocked(updateProfile).mockResolvedValue(body)
      const { result, queryClient } = renderUseUpdateProfile(role)

      act(() => result.current.mutate(body))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(updateProfile).toHaveBeenCalledWith(role, body)
      expect(queryClient.getQueryData(meQueryKey)).toMatchObject({
        [profileField]: body,
      })
      expect(toast.success).toHaveBeenCalledWith(
        TOAST_MESSAGES.profile.updateSuccess,
      )
    },
  )

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(updateProfile).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseUpdateProfile('CUSTOMER')

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('서버가 알려 준 입력란에만 오류를 표시한다', async () => {
    vi.mocked(updateProfile).mockRejectedValue(
      new ApiError('VALIDATION_ERROR', 'Bad Request', 400, [
        { field: 'regions.0', reason: 'INVALID' },
        { field: 'unknown', reason: 'INVALID' },
      ]),
    )
    const { result, onFieldErrors } = renderUseUpdateProfile('CUSTOMER')

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        regions: '지역을 다시 선택해 주세요.',
      }),
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])(
    '그 밖의 실패(%s)는 알리고 내 정보를 바꾸지 않는다',
    async (_name, error) => {
      vi.mocked(updateProfile).mockRejectedValue(error)
      const { result, queryClient, onFieldErrors } =
        renderUseUpdateProfile('CUSTOMER')

      act(() => result.current.mutate(body))

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          TOAST_MESSAGES.profile.updateFailed,
        ),
      )
      expect(onFieldErrors).not.toHaveBeenCalled()
      expect(queryClient.getQueryData(meQueryKey)).toMatchObject({
        customerProfile: savedProfile,
      })
    },
  )
})
