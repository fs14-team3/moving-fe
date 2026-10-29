import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Mover = Schemas['MoverSummary'] & {
  // TODO: BE 응답 반영 후 임시 확장 타입 제거
  description?: string | null
  favoriteCount?: number
}

export type MoverListParams = NonNullable<
  operations['listMovers']['parameters']['query']
>

export type MoverListFilters = Omit<MoverListParams, 'cursor'>

export type MoverListResponse = Omit<Schemas['MoverListResponse'], 'items'> & {
  items: Mover[]
}
