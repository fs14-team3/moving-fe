import type { Me, Role } from '@/features/auth/types'
import type {
  BasicInfoUpdate,
  PasswordChange,
  Profile,
  ProfileCreate,
  ProfileUpdate,
  UploadResponse,
} from '@/features/profile/types'
import api from '@/lib/api'

const MY_PROFILE_PATH: Record<Role, string> = {
  CUSTOMER: '/customers/me/profile',
  MOVER: '/movers/me/profile',
}

export async function createProfile(role: Role, body: ProfileCreate) {
  const { data } = await api.post<Profile>(MY_PROFILE_PATH[role], body)
  return data
}

export async function updateProfile(role: Role, body: ProfileUpdate) {
  const { data } = await api.patch<Profile>(MY_PROFILE_PATH[role], body)
  return data
}

export async function updateBasicInfo(body: BasicInfoUpdate) {
  const { data } = await api.patch<Me>('/users/me', body)
  return data
}

export async function changePassword(body: PasswordChange) {
  await api.patch('/users/me/password', body)
}

export async function uploadImage(file: File) {
  const body = new FormData()
  body.append('file', file)
  const { data } = await api.post<UploadResponse>('/uploads/images', body, {
    timeout: 30_000,
  })
  return data.url
}
