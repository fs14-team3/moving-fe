import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { MoverId } from '@/features/movers/types'
import { isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { removeFavorites } from '../api'

export function useRemoveFavorites() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (moverIds: MoverId[]) => removeFavorites(moverIds),
    onSuccess: async (_, moverIds) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.movers.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all }),
        ...moverIds.map((moverId) =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.movers.detail(moverId),
          }),
        ),
      ])
    },
    onError: (error) => {
      if (isUnauthorized(error)) return

      toast.error(TOAST_MESSAGES.favorite.updateFailed)
    },
  })

  return { mutate, isPending }
}
