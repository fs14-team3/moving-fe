import type { MoverListFilters } from './types'

// TODO: pr 108 병합 후 queryKeys.movers로 교체
export const moverQueryKeys = {
  all: ['movers'] as const,
  lists: () => [...moverQueryKeys.all, 'list'] as const,
  list: (filters: MoverListFilters = {}) =>
    [...moverQueryKeys.lists(), filters] as const,
}
