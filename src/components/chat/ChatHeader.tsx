import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Badge from '@/components/common/Badge'
import type { ChatRoom } from '@/features/chat/types'
import { formatMoveDate } from '@/features/chat/lib/messageFormat'

type ChatHeaderProps = {
  room: ChatRoom
}

export default function ChatHeader({ room }: ChatHeaderProps) {
  const opponent = room.otherParticipant
  const moveRequest = room.quote.moveRequest

  return (
    <header className="flex items-center gap-3 border-b border-line-100 px-4 py-4 md:px-6">
      <Link
        href="/chats"
        aria-label="채팅 목록으로 돌아가기"
        className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-background-200 md:hidden"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-300 font-semibold text-black-200">
        {opponent.imageUrl ? (
          <Image
            src={opponent.imageUrl}
            alt={`${opponent.name} 프로필`}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          opponent.name.slice(0, 1)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-black-400">
          {opponent.name}
        </h1>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge>{moveRequest.moveType}</Badge>
          <span className="text-xs text-gray-500">
            이사 예정일 · {formatMoveDate(moveRequest.moveDate)}
          </span>
        </div>
      </div>
    </header>
  )
}
