import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Mover = Schemas['MoverSummary'] & {
  // TODO: BE 응답 반영 후 임시 확장 타입 제거
  description?: string | null
  favoriteCount?: number
}

export type MoverDetail = Schemas['MoverDetail'] & {
  // TODO: 상세 API 응답에 포함되는지 BE 명세 확정 후 확인
  favoriteCount?: number
}

export type Review = Schemas['Review']

export type MoverListParams = NonNullable<
  operations['listMovers']['parameters']['query']
>

type MoverDetailParams = NonNullable<
  operations['getMover']['parameters']['path']
>

export type MoverId = MoverDetailParams['moverId']

export type MoverListFilters = Omit<MoverListParams, 'cursor'>

export type MoverListResponse = Omit<Schemas['MoverListResponse'], 'items'> & {
  items: Mover[]
}

export type FavoriteMoverListParams = NonNullable<
  operations['listMyFavorites']['parameters']['query']
>

export type FavoriteMoverListFilters = Omit<FavoriteMoverListParams, 'cursor'>

export type MoverReviewListParams = NonNullable<
  operations['listMoverReviews']['parameters']['query']
>

export type MoverReviewListResponse = Schemas['MoverReviewListResponse']
