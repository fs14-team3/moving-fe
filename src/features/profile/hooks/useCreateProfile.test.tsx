import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { HOME_PATH } from '@/features/auth/lib/paths'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'
import { createProfile } from '@/features/profile/api'
import { useCreateProfile } from '@/features/profile/hooks/useCreateProfile'
import { ApiError } from '@/lib/api-error'

const toast = vi.hoisted(() => ({ error: vi.fn() }))
const router = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))

vi.mock('@/features/profile/api', () => ({ createProfile: vi.fn() }))

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김가나',
    email: 'user@example.com',
    phone: null,
    hasProfile: false,
    customerProfile: null,
    moverProfile: null,
  }
}

function createValidationError(fields: string[]) {
  return new ApiError(
    'VALIDATION_ERROR',
    'Bad Request',
    400,
    fields.map((field) => ({ field, reason: 'INVALID' })),
  )
}

const body = { serviceTypes: ['SMALL' as const], regions: ['서울'] }

function renderUseCreateProfile(role: Role) {
  const onFieldErrors = vi.fn()
  const queryClient = new QueryClient()
  queryClient.setQueryData(meQueryKey, createUser(role))

  const { result } = renderHook(() => useCreateProfile(role, onFieldErrors), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  return { result, queryClient, onFieldErrors }
}

describe('useCreateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('location', { replace: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each<[Role, keyof Me]>([
    ['CUSTOMER', 'customerProfile'],
    ['MOVER', 'moverProfile'],
  ])(
    '%s 프로필을 등록하면 내 정보에 반영하고 기본 페이지로 이동한다',
    async (role, profileField) => {
      vi.mocked(createProfile).mockResolvedValue(body)
      const { result, queryClient } = renderUseCreateProfile(role)

      act(() => result.current.mutate(body))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(createProfile).toHaveBeenCalledWith(role, body)
      expect(queryClient.getQueryData(meQueryKey)).toMatchObject({
        hasProfile: true,
        [profileField]: body,
      })
      expect(router.replace).toHaveBeenCalledWith(HOME_PATH[role])
    },
  )

  it('등록 전에 시작된 내 정보 요청이 늦게 끝나도 등록 결과를 덮어쓰지 않는다', async () => {
    const staleMe = Promise.withResolvers<Me>()
    vi.mocked(createProfile).mockResolvedValue(body)
    const { result, queryClient } = renderUseCreateProfile('CUSTOMER')
    void queryClient.prefetchQuery({
      queryKey: meQueryKey,
      queryFn: () => staleMe.promise,
    })

    act(() => result.current.mutate(body))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    await act(async () => staleMe.resolve(createUser('CUSTOMER')))

    expect(queryClient.getQueryData(meQueryKey)).toMatchObject({
      hasProfile: true,
      customerProfile: body,
    })
  })

  it.each<[Role, string]>([
    ['CUSTOMER', '/profile/edit'],
    ['MOVER', '/mover/mypage'],
  ])(
    '%s 프로필이 이미 있으면 %s를 새로 불러와 최신 내 정보로 안내한다',
    async (role, path) => {
      vi.mocked(createProfile).mockRejectedValue(
        new ApiError('PROFILE_ALREADY_EXISTS', 'Conflict', 409),
      )
      const { result } = renderUseCreateProfile(role)

      act(() => result.current.mutate(body))

      await waitFor(() => expect(location.replace).toHaveBeenCalledWith(path))
      expect(router.replace).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    },
  )

  it('세션이 만료되면 로그인 이동에 맡기고 따로 알리지 않는다', async () => {
    vi.mocked(createProfile).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 'Unauthorized', 401),
    )
    const { result } = renderUseCreateProfile('CUSTOMER')

    act(() => result.current.mutate(body))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    expect(location.replace).not.toHaveBeenCalled()
  })

  it('서버가 알려 준 입력란에만 오류를 표시하고 모르는 필드는 무시한다', async () => {
    vi.mocked(createProfile).mockRejectedValue(
      createValidationError(['nickname', 'regions.0', 'unknown']),
    )
    const { result, onFieldErrors } = renderUseCreateProfile('MOVER')

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(onFieldErrors).toHaveBeenCalledWith({
        nickname: '별명을 다시 확인해 주세요.',
        regions: '지역을 다시 선택해 주세요.',
      }),
    )
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('일반 유저 폼에 없는 입력란의 오류는 알림으로 대신한다', async () => {
    vi.mocked(createProfile).mockRejectedValue(
      createValidationError(['nickname']),
    )
    const { result, onFieldErrors } = renderUseCreateProfile('CUSTOMER')

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.profile.profileCreateFailed,
      ),
    )
    expect(onFieldErrors).not.toHaveBeenCalled()
  })

  it.each([
    ['서버 오류', new ApiError('INTERNAL_ERROR', 'Server Error', 500)],
    ['알 수 없는 입력란', createValidationError(['unknown'])],
    ['ApiError가 아닌 오류', new Error('Network Error')],
  ])('그 밖의 실패(%s)는 알리고 페이지에 머문다', async (_name, error) => {
    vi.mocked(createProfile).mockRejectedValue(error)
    const { result, queryClient, onFieldErrors } =
      renderUseCreateProfile('CUSTOMER')

    act(() => result.current.mutate(body))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.profile.profileCreateFailed,
      ),
    )
    expect(onFieldErrors).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(meQueryKey)).toMatchObject({
      hasProfile: false,
    })
  })
})
