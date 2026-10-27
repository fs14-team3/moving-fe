import { useMutation, useQueryClient } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me } from '@/features/auth/types'
import { ApiError } from '@/lib/api-error'
import QueryProvider from '@/providers/QueryProvider'

const mocks = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

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

function createApiError(status: number) {
  return new ApiError('UNKNOWN_ERROR', 'Request failed', status)
}

function renderWithProvider<T>(hook: () => T) {
  const { result } = renderHook(
    () => ({ queryClient: useQueryClient(), value: hook() }),
    { wrapper: QueryProvider },
  )
  result.current.queryClient.setQueryData(meQueryKey, user)
  return result
}

function fetchFailingQuery(
  queryClient: ReturnType<typeof useQueryClient>,
  error: Error,
) {
  const queryFn = vi.fn(() => Promise.reject(error))
  const request = queryClient
    .fetchQuery({ queryKey: ['quotes'], queryFn, retryDelay: 0 })
    .catch(() => {})
  return { queryFn, request }
}

const loginPath = '/login?redirect=%2Fmy-quotes'

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.replaceState(null, '', '/my-quotes')
  })

  it('로그인 중 조회 요청이 401로 실패하면 로그인 페이지로 보낸다', async () => {
    const result = renderWithProvider(() => null)

    await fetchFailingQuery(result.current.queryClient, createApiError(401))
      .request

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith(loginPath))
  })

  it('로그인 중 변경 요청이 401로 실패해도 로그인 페이지로 보낸다', async () => {
    const result = renderWithProvider(() =>
      useMutation({ mutationFn: () => Promise.reject(createApiError(401)) }),
    )

    act(() => result.current.value.mutate())

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith(loginPath))
  })

  it('401을 직접 처리하겠다고 표시한 변경 요청은 로그인 페이지로 보내지 않는다', async () => {
    const result = renderWithProvider(() =>
      useMutation({
        mutationFn: () => Promise.reject(createApiError(401)),
        meta: { ignoreUnauthorized: true },
      }),
    )

    act(() => result.current.value.mutate())

    await waitFor(() => expect(result.current.value.isError).toBe(true))
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it.each([401, 403, 404])('%i 응답은 다시 요청하지 않는다', async (status) => {
    const result = renderWithProvider(() => null)

    const { queryFn, request } = fetchFailingQuery(
      result.current.queryClient,
      createApiError(status),
    )
    await request

    expect(queryFn).toHaveBeenCalledOnce()
  })

  it.each<[string, Error]>([
    ['서버 오류', createApiError(500)],
    ['네트워크 오류', new ApiError('NETWORK_ERROR', 'Network Error', null)],
  ])('%s는 3번까지 다시 요청한다', async (_label, error) => {
    const result = renderWithProvider(() => null)

    const { queryFn, request } = fetchFailingQuery(
      result.current.queryClient,
      error,
    )
    await request

    expect(queryFn).toHaveBeenCalledTimes(4)
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
