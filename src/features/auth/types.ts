export type Role = 'CUSTOMER' | 'MOVER'

export type ServiceType = 'SMALL' | 'HOME' | 'OFFICE'

export type Profile = {
  imageUrl?: string | null
  nickname?: string | null
  careerYears?: number | null
  intro?: string | null
  description?: string | null
  serviceTypes?: ServiceType[] | null
  regions?: string[] | null
}

export type Me = {
  id: string
  role: Role
  name: string | null
  email: string | null
  phone: string | null
  hasProfile: boolean
  customerProfile: Profile | null
  moverProfile: Profile | null
}
