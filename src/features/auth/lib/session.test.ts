import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { meQueryKey } from '@/features/auth/queryKeys'
import { handleUnauthorized, resetSession } from '@/features/auth/lib/session'
import type { Me, Role } from '@/features/auth/types'

const toast = vi.hoisted(() => ({ info: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

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

const quotesQueryKey = ['quotes']

function createQueryClient(me?: Me) {
  const queryClient = new QueryClient()
  if (me) queryClient.setQueryData(meQueryKey, me)
  queryClient.setQueryData(quotesQueryKey, [])
  return queryClient
}

function createRouter() {
  const replace = vi.fn()
  const router = { replace } as unknown as Parameters<
    typeof handleUnauthorized
  >[1]
  return { router, replace }
}

describe('resetSession', () => {
  it('다른 쿼리를 지우고 내 정보는 비회원(null)으로 남긴다', async () => {
    const queryClient = createQueryClient(user)

    await resetSession(queryClient, null)

    expect(queryClient.getQueryData(meQueryKey)).toBeNull()
    expect(
      queryClient.getQueryCache().find({ queryKey: quotesQueryKey }),
    ).toBeUndefined()
  })

  it('진행 중인 내 정보 요청이 끝나도 지운 세션을 되살리지 않는다', async () => {
    const queryClient = createQueryClient()
    let resolveMe: (me: Me) => void = () => {}
    const request = queryClient.fetchQuery({
      queryKey: meQueryKey,
      queryFn: () =>
        new Promise<Me>((resolve) => {
          resolveMe = resolve
        }),
    })

    await resetSession(queryClient, null)
    resolveMe(user)
    await request.catch(() => {})

    expect(queryClient.getQueryData(meQueryKey)).toBeNull()
  })

  it('이전 세션의 쿼리를 지우고 새 내 정보로 시작한다', async () => {
    const queryClient = createQueryClient()
    const mover: Me = { ...user, id: 'user-2', role: 'MOVER' }

    await resetSession(queryClient, mover)

    expect(queryClient.getQueryData(meQueryKey)).toEqual(mover)
    expect(
      queryClient.getQueryCache().find({ queryKey: quotesQueryKey }),
    ).toBeUndefined()
  })
})

describe('handleUnauthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인하지 않은 상태면 비회원으로만 표시하고 이동하지 않는다', async () => {
    const queryClient = createQueryClient()
    const { router, replace } = createRouter()

    await handleUnauthorized(queryClient, router)

    expect(queryClient.getQueryData(meQueryKey)).toBeNull()
    expect(
      queryClient.getQueryCache().find({ queryKey: quotesQueryKey }),
    ).toBeDefined()
    expect(toast.info).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it.each<[Role, string]>([
    ['CUSTOMER', '/login'],
    ['MOVER', '/mover/login'],
  ])(
    '%s의 세션이 만료되면 캐시를 비우고 알린 뒤 로그인 페이지(%s)로 보낸다',
    async (role, loginPath) => {
      const queryClient = createQueryClient({ ...user, role })
      const { router, replace } = createRouter()

      await handleUnauthorized(queryClient, router)

      expect(queryClient.getQueryData(meQueryKey)).toBeNull()
      expect(
        queryClient.getQueryCache().find({ queryKey: quotesQueryKey }),
      ).toBeUndefined()
      expect(toast.info).toHaveBeenCalledWith(
        TOAST_MESSAGES.auth.sessionExpired,
      )
      expect(replace).toHaveBeenCalledWith(loginPath)
    },
  )
})
