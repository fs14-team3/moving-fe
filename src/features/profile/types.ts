import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Profile = Schemas['CustomerProfile'] | Schemas['MoverProfile']

export type ProfileCreate =
  Schemas['CustomerProfileCreate'] | Schemas['MoverProfileCreate']

export type ProfileField = keyof ProfileCreate

export type ProfileFieldErrors = Partial<Record<ProfileField, string>>
