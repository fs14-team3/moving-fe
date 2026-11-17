'use client'

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import ChatRoomList from '@/components/chat/ChatRoomList'
import { useChatRooms } from '@/features/chat/hooks/useChatRooms'

export default function ChatsPage() {
  const { user } = useCurrentUser()
  const { data: rooms, isPending, isError } = useChatRooms()

  return (
    <main className="min-h-page px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-black-400 md:text-3xl">채팅</h1>
        <p className="mt-2 text-sm text-gray-500 md:text-base">
          이사 관련 문의와 일정을 편하게 이야기해 보세요.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-line-200 bg-white md:mt-8">
          <div className="border-b border-line-100 px-4 py-4 md:px-5">
            <h2 className="font-semibold text-black-400">대화 목록</h2>
          </div>

          {isPending ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">
              채팅 목록을 불러오는 중입니다.
            </div>
          ) : isError ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-red-500">
              채팅 목록을 불러오지 못했습니다.
            </div>
          ) : user ? (
            <ChatRoomList rooms={rooms ?? []} userRole={user.role} />
          ) : null}
        </div>
      </div>
    </main>
  )
}
