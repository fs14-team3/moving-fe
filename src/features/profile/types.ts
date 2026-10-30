import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Profile = Schemas['CustomerProfile'] | Schemas['MoverProfile']

export type ProfileCreate =
  Schemas['CustomerProfileCreate'] | Schemas['MoverProfileCreate']

export type ProfileField = keyof ProfileCreate

export type ProfileFieldErrors = Partial<Record<ProfileField, string>>

export type ProfileUpdate =
  Schemas['CustomerProfileUpdate'] | Schemas['MoverProfileUpdate']

export type ProfileFormMode = 'register' | 'edit'

export type BasicInfoUpdate = Schemas['BasicInfoUpdate'] & {
  currentPassword?: string
  newPassword?: string
}

export type BasicInfoField = keyof BasicInfoUpdate

export type BasicInfoFieldErrors = Partial<Record<BasicInfoField, string>>
