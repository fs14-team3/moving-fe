import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markChatRoomAsRead } from '@/features/chat/api'
import { queryKeys } from '@/lib/queryKeys'

export function useMarkChatRoomAsRead(chatRoomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markChatRoomAsRead(chatRoomId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chats.list(),
      })
    },
  })
}
