import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Role = Schemas['Role']

export type Me = Schemas['Me']

export type LoginRequest = Schemas['LoginRequest']

export type SignupRequest = Schemas['SignupRequest']

// TODO(#61): 명세에서 accessToken이 빠지면 Omit 없이 생성된 타입 사용
export type AuthResponse = Omit<Schemas['AuthResponse'], 'accessToken'>
