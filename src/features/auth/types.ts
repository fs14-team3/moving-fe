import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Role = Schemas['Role']

export type SocialProvider = components['parameters']['ProviderPath']

export type Me = Schemas['Me']

export type LoginRequest = Schemas['LoginRequest']

export type SignupRequest = Schemas['SignupRequest']

export type AuthResponse = Schemas['AuthResponse']
