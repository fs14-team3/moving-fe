import type { Me, Role } from '@/features/auth/types'

export type RouteAccess =
  'PUBLIC' | 'GUEST' | { role: Role; hasProfile: boolean }

const ROUTE_ACCESS: Record<string, RouteAccess> = {
  '/login': 'GUEST',
  '/signup': 'GUEST',
  '/profile/register': { role: 'CUSTOMER', hasProfile: false },
  '/profile/edit': { role: 'CUSTOMER', hasProfile: true },
  '/mover': { role: 'MOVER', hasProfile: true },
  '/mover/login': 'GUEST',
  '/mover/signup': 'GUEST',
  '/mover/profile/register': { role: 'MOVER', hasProfile: false },
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
  return user?.role === access.role && user.hasProfile === access.hasProfile
}
