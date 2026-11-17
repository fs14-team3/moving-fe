import { useQuery } from '@tanstack/react-query'
import { MOCK_CHAT_ROOMS } from '@/features/chat/fixtures/chatRooms'
import { queryKeys } from '@/lib/queryKeys'

export function useChatRooms() {
  return useQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: () => MOCK_CHAT_ROOMS,
  })
}
