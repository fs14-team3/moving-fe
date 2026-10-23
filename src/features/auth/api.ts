import type { Me } from '@/features/auth/types'
import { api, isUnauthorized } from '@/lib/api'

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
