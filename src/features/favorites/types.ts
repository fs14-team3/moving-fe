import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type FavoriteState = Schemas['FavoriteState']

export type FavoriteMoverListParams = NonNullable<
  operations['listMyFavorites']['parameters']['query']
>

export type FavoriteMoverListFilters = Omit<FavoriteMoverListParams, 'cursor'>

// TODO: BE 머지 후 생성된 스키마 타입으로 교체
export type RemoveFavoritesResponse = {
  removedCount: number
}
