import { useQuery } from '@tanstack/react-query'
import { getChatRooms } from '@/features/chat/api'
import { queryKeys } from '@/lib/queryKeys'

export function useChatRooms() {
  return useQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: () => getChatRooms(),
  })
}
