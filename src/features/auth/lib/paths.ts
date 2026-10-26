import type { Me, Role } from '@/features/auth/types'

export const LOGIN_PATH: Record<Role, string> = {
  CUSTOMER: '/login',
  MOVER: '/mover/login',
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

// TODO(#42): #40 · #41의 프로필 등록 페이지가 생기면 '/profile/register' · '/mover/profile/register'로 변경
const PROFILE_REGISTER_PATH: Record<Role, string> = {
  CUSTOMER: '/',
  MOVER: '/',
}

export function getPathAfterLogin({ role, hasProfile }: Me) {
  return hasProfile ? HOME_PATH[role] : PROFILE_REGISTER_PATH[role]
}
