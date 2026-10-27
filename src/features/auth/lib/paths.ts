import {
  canAccess,
  getRouteAccess,
  type RouteAccess,
} from '@/features/auth/lib/access'
import type { Me, Role } from '@/features/auth/types'

export const LOGIN_PATH: Record<Role, string> = {
  CUSTOMER: '/login',
  MOVER: '/mover/login',
}

export function getLoginPath(role: Role, redirect: string) {
  return `${LOGIN_PATH[role]}?${new URLSearchParams({ redirect })}`
}

export const SIGNUP_PATH: Record<Role, string> = {
  CUSTOMER: '/signup',
  MOVER: '/mover/signup',
}

// TODO(#67): #13 · #23의 기본 페이지가 생기면 '/request' · '/mover/requests'로 변경
const HOME_PATH: Record<Role, string> = {
  CUSTOMER: '/',
  MOVER: '/',
}

const PROFILE_REGISTER_PATH: Record<Role, string> = {
  CUSTOMER: '/profile/register',
  MOVER: '/mover/profile/register',
}

const URL_BASE = 'http://localhost'

type PathParts = Pick<URL, 'pathname' | 'search' | 'hash'>

function toPath({ pathname, search, hash }: PathParts) {
  return `${pathname}${search}${hash}`
}

export function getCurrentPath() {
  return toPath(window.location)
}

function getRedirectParam() {
  return new URLSearchParams(window.location.search).get('redirect')
}

function parseLocalUrl(path: string) {
  try {
    const url = new URL(path, URL_BASE)
    return url.origin === URL_BASE ? url : null
  } catch {
    return null
  }
}

function getSafeRedirect(redirect: string, user: Me) {
  const url = parseLocalUrl(redirect)
  if (!url || !canAccess(getRouteAccess(url.pathname), user)) return null

  const path = toPath(url)
  return parseLocalUrl(path) ? path : null
}

export function getPathAfterLogin(user: Me, redirect?: string | null) {
  if (!user.hasProfile) return PROFILE_REGISTER_PATH[user.role]

  const path = redirect ? getSafeRedirect(redirect, user) : null
  return path ?? HOME_PATH[user.role]
}

export function getRedirectPath(access: RouteAccess, user: Me | null) {
  if (user) {
    const redirect = access === 'GUEST' ? getRedirectParam() : null
    return getPathAfterLogin(user, redirect)
  }
  if (access === 'PUBLIC' || access === 'GUEST') return null
  return getLoginPath(access.role, getCurrentPath())
}
