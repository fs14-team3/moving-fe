import { useQuery } from '@tanstack/react-query'
import { getChatMessages } from '@/features/chat/api'
import { queryKeys } from '@/lib/queryKeys'

export function useChatMessages(chatRoomId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chats.messages(chatRoomId),
    queryFn: () => getChatMessages(chatRoomId),
    enabled: enabled && Boolean(chatRoomId),
  })
}
