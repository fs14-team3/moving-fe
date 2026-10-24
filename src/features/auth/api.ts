import type { AuthResponse, LoginRequest, Me } from '@/features/auth/types'
import { api, isUnauthorized } from '@/lib/api'

export async function login(body: LoginRequest) {
  const { data } = await api.post<AuthResponse>('/auth/login', body)
  return data.user
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
