import type { Role } from '@/features/auth/types'
import type { Profile, ProfileCreate } from '@/features/profile/types'
import api from '@/lib/api'

const MY_PROFILE_PATH: Record<Role, string> = {
  CUSTOMER: '/customers/me/profile',
  MOVER: '/movers/me/profile',
}

export async function createProfile(role: Role, body: ProfileCreate) {
  const { data } = await api.post<Profile>(MY_PROFILE_PATH[role], body)
  return data
}
