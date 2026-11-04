'use client'

import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Notification,
  NotificationType,
} from '@/features/notifications/api'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useReadNotifications } from '@/features/notifications/hooks/useReadNotifications'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount'
import { useDismiss } from '@/hooks/useDismiss'
import { formatTimeAgo } from '@/lib/formatTimeAgo'

// 서버가 문구를 주지 않았을 때 보여줄 기본 문구
const DEFAULT_MESSAGE: Record<NotificationType, string> = {
  NEW_REQUEST: '새로운 견적 요청이 도착했어요',
  NEW_QUOTE: '새로운 견적이 도착했어요',
  QUOTE_CONFIRMED: '견적이 확정되었어요',
  MOVE_DAY: '내일은 이사 예정일이에요',
}

// TODO(#87): 시안처럼 이사 종류·지역 등을 강조하려면 BE에 payload 구조를 받아서 문구를 조합한다.
function toMessage(notification: Notification) {
  return notification.message || DEFAULT_MESSAGE[notification.type]
}

function PanelStatus({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-gray-400 md:text-base">
      {children}
    </p>
  )
}

export default function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const loadMoreRef = useRef<HTMLLIElement>(null)
  const panelId = useId()
  const titleId = useId()
  const { hasUnread } = useUnreadNotificationCount()
  const { mutate: readNotifications } = useReadNotifications()
  const {
    notifications,
    hasData,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useNotifications({ enabled: isOpen })
  // 패널에 그려진 알림 중 읽지 않은 것. 닫을 때 이 알림들만 읽음 처리한다.
  const shownUnreadIds = useMemo(
    () => notifications.filter(({ readAt }) => !readAt).map(({ id }) => id),
    [notifications],
  )

  // 열어 둔 동안 읽음 처리하면 다음 페이지(읽지 않은 알림만)가 어긋나서, 닫을 때 한 번에 읽음 처리한다.
  const close = useCallback(() => {
    setIsOpen(false)
    if (shownUnreadIds.length > 0) readNotifications(shownUnreadIds)
  }, [shownUnreadIds, readNotifications])

  useDismiss({ isOpen, onDismiss: close, containerRef, triggerRef })

  const toggle = () => {
    if (isOpen) close()
    else setIsOpen(true)
  }

  // 목록 끝이 보이면 다음 페이지를 불러온다. 실패하면 다시 시도 버튼으로만 불러온다.
  useEffect(() => {
    const target = loadMoreRef.current
    if (
      !isOpen ||
      !target ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    )
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage()
      },
      { root: listRef.current, rootMargin: '100px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [
    isOpen,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  ])

  const renderContent = () => {
    if (isPending) {
      return (
        <div role="status" className="flex justify-center py-10">
          <LoaderCircle
            aria-hidden="true"
            className="size-6 animate-spin text-primary-400"
          />
          <span className="sr-only">알림을 불러오고 있습니다.</span>
        </div>
      )
    }

    if (isError && !hasData) {
      return (
        <div role="alert" className="flex flex-col items-center gap-2 py-10">
          <p className="text-sm text-gray-400 md:text-base">
            알림을 불러오지 못했습니다.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-primary-400"
          >
            다시 시도
          </button>
        </div>
      )
    }

    if (notifications.length === 0) {
      return <PanelStatus>모든 알림을 확인하였습니다</PanelStatus>
    }

    return (
      <ul
        ref={listRef}
        className="max-h-90 divide-y divide-line-200 overflow-y-auto px-2 md:max-h-100 md:px-4"
      >
        {notifications.map((notification) => (
          <li key={notification.id} className="px-4 py-4 md:px-6">
            <p className="text-sm leading-6 font-medium break-keep text-black-400 md:text-base md:leading-7">
              {toMessage(notification)}
            </p>
            <time
              dateTime={notification.createdAt}
              className="mt-1 block text-xs text-gray-300 md:text-sm"
            >
              {formatTimeAgo(notification.createdAt)}
            </time>
          </li>
        ))}
        {hasNextPage && (
          <li ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <LoaderCircle
                aria-label="알림을 더 불러오고 있습니다."
                className="size-5 animate-spin text-primary-400"
              />
            ) : (
              isFetchNextPageError && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="text-sm font-semibold text-primary-400"
                >
                  알림 더 불러오기
                </button>
              )
            )}
          </li>
        )}
      </ul>
    )
  }

  return (
    // 모바일은 헤더 너비에 맞춰 펼치고, 태블릿부터는 종 아이콘 아래에 붙인다.
    <div ref={containerRef} className="md:relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={hasUnread ? '알림, 새 알림 있음' : '알림'}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        className="relative flex"
      >
        <Image
          src="/assets/icons/alarm.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 lg:size-9"
        />
        {hasUnread && (
          <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-white lg:size-3" />
        )}
      </button>
      {isOpen && (
        <section
          id={panelId}
          aria-labelledby={titleId}
          className="absolute inset-x-6 top-full z-10 rounded-3xl border border-line-200 bg-white pb-2 shadow-sm md:inset-x-auto md:-right-15 md:mt-3.75 md:w-84 lg:-right-7 lg:mt-6.5 lg:w-92"
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-2 md:px-10 md:pt-6">
            <h2
              id={titleId}
              className="text-base font-bold text-black-400 md:text-lg"
            >
              알림
            </h2>
            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => {
                close()
                triggerRef.current?.focus()
              }}
              className="flex size-6 items-center justify-center"
            >
              <Image
                src="/assets/icons/Xicon.png"
                alt=""
                width={72}
                height={72}
                className="size-6"
              />
            </button>
          </div>
          {renderContent()}
        </section>
      )}
    </div>
  )
}
