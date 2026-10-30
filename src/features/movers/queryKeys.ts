import type {
  FavoriteMoverListFilters,
  MoverId,
  MoverListFilters,
} from './types'

// TODO(#108): 병합 후 공통 queryKeys로 교체
export const moverQueryKeys = {
  all: ['movers'] as const,

  lists: () => [...moverQueryKeys.all, 'list'] as const,
  list: (filters: MoverListFilters = {}) =>
    [...moverQueryKeys.lists(), filters] as const,

  detail: (moverId: MoverId) =>
    [...moverQueryKeys.all, 'detail', moverId] as const,
}

// TODO(#108): 병합 후 공통 queryKeys로 교체
export const favoriteMoverQueryKeys = {
  all: ['favorites'] as const,
  list: (filters: FavoriteMoverListFilters = {}) =>
    [...favoriteMoverQueryKeys.all, 'list', filters] as const,
}
