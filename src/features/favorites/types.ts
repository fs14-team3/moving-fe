import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type FavoriteState = Schemas['FavoriteState']

export type FavoriteMoverListParams = NonNullable<
  operations['listMyFavorites']['parameters']['query']
>

export type FavoriteMoverListFilters = Omit<FavoriteMoverListParams, 'cursor'>
