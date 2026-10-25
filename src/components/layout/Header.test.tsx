import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Header from '@/components/layout/Header'
import { NAV_ITEMS } from '@/constants/navigation'
import { meQueryKey } from '@/features/auth/queryKeys'
import type { Me, Role } from '@/features/auth/types'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('@/features/auth/api', () => ({
  getMe: () => new Promise(() => {}),
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
  if (user !== undefined) queryClient.setQueryData(meQueryKey, user)

  render(
    <QueryClientProvider client={queryClient}>
      <Header />
    </QueryClientProvider>,
  )
}

function getLinkLabels() {
  return within(screen.getByRole('navigation'))
    .getAllByRole('link')
    .map((link) => link.textContent)
    .filter(Boolean)
}

describe('Header', () => {
  it('내 정보를 불러오는 동안에는 메뉴와 로그인 버튼을 보여 주지 않는다', () => {
    renderHeader()

    expect(getLinkLabels()).toEqual([])
  })

  it.each([
    ['비회원', null, [...NAV_ITEMS.GUEST, { label: '로그인', href: '/login' }]],
    ['일반 유저', createUser('CUSTOMER'), NAV_ITEMS.CUSTOMER],
    ['기사님', createUser('MOVER'), NAV_ITEMS.MOVER],
  ])('%s에게 맞는 메뉴를 보여 준다', (_, user, items) => {
    renderHeader(user)

    expect(getLinkLabels()).toEqual(items.map(({ label }) => label))
  })
})
