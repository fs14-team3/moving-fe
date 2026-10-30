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

export const MOVER_MYPAGE_PATH = '/mover/mypage'

export const PROFILE_EDIT_PATH: Record<Role, string> = {
  CUSTOMER: '/profile/edit',
  MOVER: MOVER_MYPAGE_PATH,
}

// TODO(#68): #11 · #24에서 페이지 경로가 정해지면 찜한 기사님 · 이사 리뷰 경로 맞추기
export const PROFILE_MENU_ITEMS: Record<Role, NavItem[]> = {
  CUSTOMER: [
    { label: '프로필 수정', href: PROFILE_EDIT_PATH.CUSTOMER },
    { label: '찜한 기사님', href: '/favorites' },
    { label: '이사 리뷰', href: '/my-reviews' },
  ],
  MOVER: [{ label: '마이페이지', href: PROFILE_EDIT_PATH.MOVER }],
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
