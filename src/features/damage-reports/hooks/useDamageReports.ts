import { useQuery } from '@tanstack/react-query'
import { getDamageReports } from '@/features/damage-reports/api'
import { URL_REFRESH_INTERVAL } from '@/features/proof-photos/hooks/useProofPhotos'
import { queryKeys } from '@/lib/queryKeys'

export function useDamageReports(quoteId: string) {
  const {
    data,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: queryKeys.damageReports.list(quoteId),
    queryFn: () => getDamageReports(quoteId),
    refetchInterval: URL_REFRESH_INTERVAL,
  })

  return {
    reports: data?.items ?? [],
    canReport: data?.canReport ?? false,
    isPending,
    isLoadingError,
    isRefetchError,
    refetch,
    isRefetching,
  }
}
