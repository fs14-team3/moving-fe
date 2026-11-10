import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import type { MoverId } from '@/features/movers/types'
import { isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addFavorite } from '../api'

export function useAddFavorite(moverId: MoverId) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => addFavorite(moverId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.movers.lists() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.movers.detail(moverId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all }),
      ])
    },
    onError: (error) => {
      if (isUnauthorized(error)) return

      toast.error(TOAST_MESSAGES.favorite.updateFailed)
    },
  })

  return {
    mutate,
    isPending,
  }
}
