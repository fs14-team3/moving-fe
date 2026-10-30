import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthGuard from '@/components/auth/AuthGuard'
import { getMe } from '@/features/auth/api'
import { getPathAfterLogin } from '@/features/auth/lib/paths'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'

const navigation = vi.hoisted(() => ({
  pathname: '/',
  router: { replace: vi.fn() },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router,
}))

vi.mock('@/features/auth/api', () => ({
  getMe: vi.fn(() => new Promise(() => {})),
}))

function createUser(role: Role, hasProfile = true): Me {
  return {
    id: 'user-1',
    role,
    name: null,
    email: null,
    phone: null,
    hasProfile,
    customerProfile: null,
    moverProfile: null,
  }
}

const customer = createUser('CUSTOMER')
const mover = createUser('MOVER')
const newCustomer = createUser('CUSTOMER', false)
const newMover = createUser('MOVER', false)

function renderGuard(url: string, user?: Me | null) {
  window.history.replaceState(null, '', url)
  navigation.pathname = window.location.pathname

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  if (user !== undefined) queryClient.setQueryData(meQueryKey, user)

  render(
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <h1>페이지 내용</h1>
      </AuthGuard>
    </QueryClientProvider>,
  )

  return queryClient
}

function setUser(queryClient: QueryClient, user: Me | null) {
  act(() => {
    queryClient.setQueryData(meQueryKey, user)
  })
}

describe('AuthGuard', () => {
  beforeEach(() => {
    navigation.router.replace.mockClear()
  })

  it('비회원을 지금 주소의 쿼리와 해시까지 담아 로그인 페이지로 보낸다', () => {
    renderGuard('/mover/requests?status=pending#quote', null)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(navigation.router.replace).toHaveBeenCalledWith(
      '/mover/login?redirect=%2Fmover%2Frequests%3Fstatus%3Dpending%23quote',
    )
  })

  it('로그인 페이지에서 세션이 생기면 redirect의 페이지로 보낸다', async () => {
    const queryClient = renderGuard(
      '/mover/login?redirect=%2Fmover%2Frequests%3Fstatus%3Dpending%23quote',
      null,
    )
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(navigation.router.replace).not.toHaveBeenCalled()

    setUser(queryClient, mover)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        '/mover/requests?status=pending#quote',
      ),
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('redirect가 외부 주소로 해석되면 기본 페이지로 보낸다', async () => {
    const queryClient = renderGuard(
      '/login?redirect=%2F.%2F%2Fexample.com',
      null,
    )

    setUser(queryClient, customer)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        getPathAfterLogin(customer),
      ),
    )
    expect(navigation.router.replace).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/\//),
    )
  })

  it('보던 중 세션이 사라지면 지금 주소를 담아 로그인 페이지로 보낸다', async () => {
    const queryClient = renderGuard(
      '/mover/requests?status=pending#quote',
      mover,
    )
    expect(screen.getByRole('heading')).toBeInTheDocument()

    setUser(queryClient, null)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        '/mover/login?redirect=%2Fmover%2Frequests%3Fstatus%3Dpending%23quote',
      ),
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('보던 중 다른 유저 타입으로 바뀌면 그 유저의 기본 페이지로 보낸다', async () => {
    const queryClient = renderGuard('/mover/requests', mover)

    setUser(queryClient, customer)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        getPathAfterLogin(customer),
      ),
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('세션을 확인하는 동안에는 페이지 내용을 보여 주지 않는다', async () => {
    const me = Promise.withResolvers<Me>()
    vi.mocked(getMe).mockReturnValueOnce(me.promise)
    renderGuard('/mover/requests')

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    me.resolve(mover)

    expect(await screen.findByRole('heading')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(navigation.router.replace).not.toHaveBeenCalled()
  })

  it('세션 확인에 실패하면 다시 시도해 페이지 내용을 보여 준다', async () => {
    const retried = Promise.withResolvers<Me>()
    vi.mocked(getMe)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockReturnValueOnce(retried.promise)
    const user = userEvent.setup()
    renderGuard('/mover/requests')

    const retry = await screen.findByRole('button', { name: '다시 시도' })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    await user.click(retry)
    expect(await screen.findByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    retried.resolve(mover)

    expect(await screen.findByRole('heading')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(navigation.router.replace).not.toHaveBeenCalled()
  })

  it('보던 중 세션 확인에 실패하면 오류 화면으로 바꾸고, 다시 시도하는 동안 버튼을 막는다', async () => {
    const retried = Promise.withResolvers<Me>()
    vi.mocked(getMe)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockReturnValueOnce(retried.promise)
    const user = userEvent.setup()
    const queryClient = renderGuard('/mover/requests', mover)
    expect(screen.getByRole('heading')).toBeInTheDocument()

    await act(() => queryClient.refetchQueries({ queryKey: meQueryKey }))

    const retry = await screen.findByRole('button', { name: '다시 시도' })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    await user.click(retry)
    await waitFor(() => expect(retry).toBeDisabled())

    retried.resolve(mover)

    expect(await screen.findByRole('heading')).toBeInTheDocument()
    expect(navigation.router.replace).not.toHaveBeenCalled()
  })

  it.each<[string, Me, string]>([
    ['/mover/requests', newMover, '/mover/profile/register'],
    ['/mover/profile/register', newCustomer, '/profile/register'],
    ['/profile/register', newMover, '/mover/profile/register'],
    ['/profile/edit', newCustomer, '/profile/register'],
  ])(
    '프로필이 없는 유저가 %s에 들어가면 자기 프로필 등록 페이지로 보낸다',
    (url, user, path) => {
      renderGuard(url, user)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(navigation.router.replace).toHaveBeenCalledWith(path)
    },
  )

  it.each<[string, Me]>([
    ['/profile/register', newCustomer],
    ['/mover/profile/register', newMover],
  ])('프로필이 없는 유저는 %s를 볼 수 있다', (url, user) => {
    renderGuard(url, user)

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(navigation.router.replace).not.toHaveBeenCalled()
  })

  it.each(['/', '/movers', '/movers/mover-1'])(
    '프로필이 없어도 공개 페이지 %s는 볼 수 있다',
    (url) => {
      renderGuard(url, newCustomer)

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(navigation.router.replace).not.toHaveBeenCalled()
    },
  )

  it.each<[string, Me]>([
    ['/profile/register', customer],
    ['/mover/profile/register', mover],
  ])('프로필이 있는 유저가 %s에 들어가면 기본 페이지로 보낸다', (url, user) => {
    renderGuard(url, user)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(navigation.router.replace).toHaveBeenCalledWith(
      getPathAfterLogin(user),
    )
  })

  it('로그인한 유저에게 프로필이 없으면 redirect 대신 프로필 등록 페이지로 보낸다', async () => {
    const queryClient = renderGuard(
      '/mover/login?redirect=%2Fmover%2Frequests',
      null,
    )

    setUser(queryClient, newMover)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        '/mover/profile/register',
      ),
    )
  })

  it('프로필을 등록하면 기본 페이지로 보내고 등록 페이지로 돌려보내지 않는다', async () => {
    const queryClient = renderGuard('/profile/register', newCustomer)
    expect(screen.getByRole('heading')).toBeInTheDocument()

    setUser(queryClient, customer)

    await waitFor(() =>
      expect(navigation.router.replace).toHaveBeenCalledWith(
        getPathAfterLogin(customer),
      ),
    )
    expect(navigation.router.replace).not.toHaveBeenCalledWith(
      '/profile/register',
    )
  })
})
