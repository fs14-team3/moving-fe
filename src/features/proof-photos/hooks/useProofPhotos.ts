import { useQuery } from '@tanstack/react-query'
import { getProofPhotos } from '@/features/proof-photos/api'
import { queryKeys } from '@/lib/queryKeys'

export function useProofPhotos(quoteId: string) {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.proofPhotos.list(quoteId),
    queryFn: () => getProofPhotos(quoteId),
  })

  return {
    photos: data?.items ?? [],
    maxCount: data?.maxCount ?? 0,
    isPending,
    isError,
    refetch,
    isRefetching,
  }
}
