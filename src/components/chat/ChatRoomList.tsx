import ChatRoomItem from '@/components/chat/ChatRoomItem'
import type { ChatRoom } from '@/features/chat/types'
import type { Role } from '@/features/auth/types'

type ChatRoomListProps = {
  rooms: ChatRoom[]
  userRole: Role
}

export default function ChatRoomList({ rooms, userRole }: ChatRoomListProps) {
  const sortedRooms = [...rooms].sort((a, b) => {
    if (!a.lastMessageAt) return 1
    if (!b.lastMessageAt) return -1

    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  })

  if (sortedRooms.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
        <p className="font-semibold text-black-300">아직 채팅 내역이 없어요.</p>
        <p className="mt-2 text-sm text-gray-500">
          견적을 주고받으면 이곳에서 대화를 시작할 수 있어요.
        </p>
      </div>
    )
  }

  return (
    <div>
      {sortedRooms.map((room) => (
        <ChatRoomItem key={room.chatRoomId} room={room} userRole={userRole} />
      ))}
    </div>
  )
}
