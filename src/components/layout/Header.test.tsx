import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Header from '@/components/layout/Header'
import { NAV_ITEMS } from '@/constants/navigation'
import { queryKeys } from '@/lib/queryKeys'
import type { Me, Role } from '@/features/auth/types'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/features/auth/api', () => ({
  getMe: () => new Promise(() => {}),
  logout: vi.fn(),
}))

vi.mock('@/features/notifications/api', () => ({
  getNotifications: () => new Promise(() => {}),
  getUnreadNotificationCount: () => new Promise(() => {}),
  readAllNotifications: vi.fn(),
}))

function createUser(role: Role): Me {
  return {
    id: 'user-1',
    role,
    name: '김무빙',
    email: null,
    phone: null,
    hasProfile: true,
    customerProfile: null,
    moverProfile: null,
  }
}

function renderHeader(user?: Me | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  if (user !== undefined) queryClient.setQueryData(queryKeys.user.me(), user)

  render(
    <QueryClientProvider client={queryClient}>
      <Header />
    </QueryClientProvider>,
  )
}

function toLabelsAndHrefs(links: HTMLElement[]) {
  return links
    .filter((link) => link.textContent)
    .map((link) => [link.textContent, link.getAttribute('href')])
}

function getMenuLinks() {
  return toLabelsAndHrefs(
    within(screen.getByRole('navigation')).getAllByRole('link'),
  )
}

function getMobileMenuLinks() {
  return toLabelsAndHrefs(
    within(screen.getByRole('dialog', { hidden: true })).getAllByRole('link', {
      hidden: true,
    }),
  )
}

describe('Header', () => {
  it('내 정보를 불러오는 동안에는 메뉴와 로그인 버튼을 보여 주지 않는다', () => {
    renderHeader()

    expect(getMenuLinks()).toEqual([])
  })

  it.each([
    ['비회원', null, [...NAV_ITEMS.GUEST, { label: '로그인', href: '/login' }]],
    ['일반 유저', createUser('CUSTOMER'), NAV_ITEMS.CUSTOMER],
    ['기사님', createUser('MOVER'), NAV_ITEMS.MOVER],
  ])(
    '%s에게 맞는 메뉴를 GNB와 모바일 메뉴에서 각 페이지로 연결한다',
    (_, user, items) => {
      renderHeader(user)

      const links = items.map(({ label, href }) => [label, href])
      expect(getMenuLinks()).toEqual(links)
      expect(getMobileMenuLinks()).toEqual(links)
    },
  )

  it('로그인한 사용자에게만 알림 아이콘을 보여 준다', () => {
    renderHeader(null)
    expect(
      screen.queryByRole('button', { name: /알림/ }),
    ).not.toBeInTheDocument()
  })

  it.each<Role>(['CUSTOMER', 'MOVER'])(
    '%s에게는 알림 아이콘을 보여 준다',
    (role) => {
      renderHeader(createUser(role))
      expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument()
    },
  )
})
