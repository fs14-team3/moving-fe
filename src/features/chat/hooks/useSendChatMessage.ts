import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '@/features/chat/api'
import { queryKeys } from '@/lib/queryKeys'

export type SendChatMessageVariables = {
  content: string
  imageUploadIds: string[]
}

export function useSendChatMessage(chatRoomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ content, imageUploadIds }: SendChatMessageVariables) =>
      sendChatMessage(chatRoomId, content, imageUploadIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chats.messages(chatRoomId),
      })

      void queryClient.invalidateQueries({
        queryKey: queryKeys.chats.list(),
      })
    },
  })
}
