import type { Role } from '@/features/auth/types'

export type NavItem = {
  label: string
  href: string
}

// TODO(#68): #13 · #23 · #24에서 페이지 경로가 정해지면 견적 요청 · 받은 요청 · 내 견적 관리 경로 맞추기
export const NAV_ITEMS: Record<Role | 'GUEST', NavItem[]> = {
  GUEST: [{ label: '기사님 찾기', href: '/movers' }],
  CUSTOMER: [
    { label: '견적 요청', href: '/request' },
    { label: '기사님 찾기', href: '/movers' },
    { label: '내 견적 관리', href: '/my-quotes' },
  ],
  MOVER: [
    { label: '받은 요청', href: '/mover/requests' },
    { label: '내 견적 관리', href: '/mover/quotes' },
  ],
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
