import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ServiceType = Schemas['ServiceType']

export type Mover = Schemas['MoverSummary'] & {
  // TODO: 목록 API 응답에 포함되는지 BE 명세 확정 후 확인
  description: string | null
  favoriteCount: number
}
