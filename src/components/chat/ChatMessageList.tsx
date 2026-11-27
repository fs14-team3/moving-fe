'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '@/components/common/modal/Modal'
import type { ChatMessage, ChatMessageImage } from '@/features/chat/types'
import {
  formatMessageDate,
  formatMessageTime,
} from '@/features/chat/lib/messageFormat'

type ChatMessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
}

type ImageViewerState = {
  images: ChatMessageImage[]
  index: number
}

export default function ChatMessageList({
  messages,
  currentUserId,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [imageViewer, setImageViewer] = useState<ImageViewerState | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-gray-500">
        아직 대화가 없습니다. 첫 메시지를 보내 보세요.
      </div>
    )
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const selectedImage = imageViewer?.images[imageViewer.index]

  function moveImage(direction: -1 | 1) {
    setImageViewer((current) => {
      if (!current) return current

      const nextIndex = current.index + direction

      if (nextIndex < 0 || nextIndex >= current.images.length) {
        return current
      }

      return { ...current, index: nextIndex }
    })
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 md:px-6">
        {sortedMessages.map((message, index) => {
          const isMine = message.senderId === currentUserId
          const previousMessage = sortedMessages[index - 1]
          const showDate =
            !previousMessage ||
            formatMessageDate(previousMessage.createdAt) !==
              formatMessageDate(message.createdAt)

          return (
            <div key={message.id}>
              {showDate && (
                <div className="mb-5 flex justify-center">
                  <span className="rounded-full bg-background-200 px-3 py-1.5 text-xs text-gray-500">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[85%] items-end gap-2 md:max-w-[70%] ${
                    isMine ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`min-w-0 rounded-2xl px-4 py-3 ${
                      isMine
                        ? 'rounded-br-sm bg-primary-400 text-white'
                        : 'rounded-bl-sm bg-background-200 text-black-400'
                    }`}
                  >
                    {!isMine && (
                      <p className="mb-1 text-xs font-semibold text-black-300">
                        {message.senderName ?? '상대방'}
                      </p>
                    )}

                    {message.content && (
                      <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}

                    {message.images.length > 0 && (
                      <div className="mt-2 grid max-w-64 grid-cols-2 gap-2">
                        {message.images.map((image, imageIndex) => (
                          <button
                            key={image.id}
                            type="button"
                            aria-label={`첨부 이미지 ${imageIndex + 1} 크게 보기`}
                            onClick={() =>
                              setImageViewer({
                                images: message.images,
                                index: imageIndex,
                              })
                            }
                            className="relative aspect-square overflow-hidden rounded-lg"
                          >
                            <Image
                              src={image.url}
                              alt={`첨부 이미지 ${imageIndex + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="shrink-0 pb-1 text-[11px] text-gray-500">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <Modal
        open={selectedImage !== undefined}
        onClose={() => setImageViewer(null)}
        title="첨부 이미지"
        className="md:w-[min(90vw,800px)]"
      >
        {selectedImage && imageViewer && (
          <>
            <div className="relative h-[60dvh] overflow-hidden rounded-xl bg-black-500">
              <Image
                src={selectedImage.url}
                alt={`첨부 이미지 ${imageViewer.index + 1}`}
                fill
                unoptimized
                className="object-contain"
              />

              {imageViewer.index > 0 && (
                <button
                  type="button"
                  aria-label="이전 이미지"
                  onClick={() => moveImage(-1)}
                  className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 text-black-400 shadow-md"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
              )}

              {imageViewer.index < imageViewer.images.length - 1 && (
                <button
                  type="button"
                  aria-label="다음 이미지"
                  onClick={() => moveImage(1)}
                  className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-50/90 text-black-400 shadow-md"
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-sm font-medium text-gray-500">
              {imageViewer.index + 1} / {imageViewer.images.length}
            </p>
          </>
        )}
      </Modal>
    </>
  )
}
