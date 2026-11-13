import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type Mover = Schemas['MoverSummary']

export type MoverDetail = Schemas['MoverDetail']

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

export type MoverReviewListParams = NonNullable<
  operations['listMoverReviews']['parameters']['query']
>

export type MoverReviewListResponse = Schemas['MoverReviewListResponse']
