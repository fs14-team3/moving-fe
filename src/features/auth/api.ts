import type {
  AuthResponse,
  LoginRequest,
  Me,
  Role,
  SignupRequest,
  SocialProvider,
} from '@/features/auth/types'
import api from '@/lib/api'
import { isUnauthorized } from '@/lib/api-error'

export async function signup(body: SignupRequest) {
  const { data } = await api.post<Me>('/auth/signup', body)
  return data
}

export async function login(body: LoginRequest) {
  const { data } = await api.post<AuthResponse>('/auth/login', body)
  return data.user
}

export function getSocialLoginUrl(provider: SocialProvider, role: Role) {
  return api.getUri({ url: `/auth/${provider}`, params: { role } })
}

export async function getMe() {
  const { data } = await api.get<Me>('/users/me')
  return data
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    if (!isUnauthorized(error)) throw error
  }
}
