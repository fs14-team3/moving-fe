import { useQuery } from '@tanstack/react-query'
import { getProofPhotos } from '@/features/proof-photos/api'
import { queryKeys } from '@/lib/queryKeys'

export const URL_REFRESH_INTERVAL = 30 * 60 * 1000

export function useProofPhotos(quoteId: string) {
  const {
    data,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: queryKeys.proofPhotos.list(quoteId),
    queryFn: () => getProofPhotos(quoteId),
    refetchInterval: URL_REFRESH_INTERVAL,
  })

  return {
    photos: data?.items ?? [],
    maxCount: data?.maxCount ?? 0,
    canEdit: data?.canEdit ?? false,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  }
}
