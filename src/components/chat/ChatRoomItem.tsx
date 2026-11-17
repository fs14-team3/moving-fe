import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/common/Badge'
import type { ChatRoom } from '@/features/chat/types'
import { formatChatTime } from '@/features/chat/lib/format'
import type { Role } from '@/features/auth/types'

type ChatRoomItemProps = {
  room: ChatRoom
  userRole: Role
}

export default function ChatRoomItem({ room, userRole }: ChatRoomItemProps) {
  const opponent = userRole === 'CUSTOMER' ? room.mover : room.customer

  return (
    <Link
      href={`/chats/${room.chatRoomId}`}
      className="flex items-center gap-3 border-b border-line-100 px-4 py-4 transition-colors hover:bg-background-200 md:px-5"
    >
      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-300 text-lg font-semibold text-black-200">
        {opponent.imageUrl ? (
          <Image
            src={opponent.imageUrl}
            alt={`${opponent.name} 프로필`}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          opponent.name.slice(0, 1)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-black-400 md:text-base">
            {opponent.name}
          </span>

          <span className="shrink-0 text-xs text-gray-500">
            {formatChatTime(room.lastMessageAt)}
          </span>
        </div>

        <p className="mb-2 truncate text-sm text-black-100">
          {room.lastMessage ?? '아직 대화가 없습니다.'}
        </p>

        <div className="flex items-center justify-between gap-2">
          <Badge>{room.moveType}</Badge>

          {room.unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-400 text-xs font-semibold text-white">
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
