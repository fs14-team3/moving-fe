import type { Me, Role } from '@/features/auth/types'

export type RouteAccess = 'PUBLIC' | 'GUEST' | Role

const ROUTE_ACCESS: Record<string, RouteAccess> = {
  '/login': 'GUEST',
  '/signup': 'GUEST',
  '/profile/register': 'CUSTOMER',
  '/mover': 'MOVER',
  '/mover/login': 'GUEST',
  '/mover/signup': 'GUEST',
}

const ROUTES = Object.keys(ROUTE_ACCESS).sort((a, b) => b.length - a.length)

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function getRouteAccess(pathname: string): RouteAccess {
  const route = ROUTES.find((route) => matchesRoute(pathname, route))
  return route ? ROUTE_ACCESS[route] : 'PUBLIC'
}

export function canAccess(access: RouteAccess, user: Me | null) {
  if (access === 'PUBLIC') return true
  if (access === 'GUEST') return !user
  // TODO(#42): 프로필이 없는 유저는 각자의 프로필 등록 페이지로 이동
  return user?.role === access
}
