'use client'

import type { Role } from '@/features/auth/types'
import type {
  Notification,
  NotificationType,
} from '@/features/notifications/api'
import { getNotificationHref } from '@/features/notifications/link'
import {
  toMessageParts,
  type MessagePart,
} from '@/features/notifications/message'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useReadAllNotifications } from '@/features/notifications/hooks/useReadAllNotifications'
import { useReadNotifications } from '@/features/notifications/hooks/useReadNotifications'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadNotificationCount'
import { receivedRequestKeys } from '@/features/received-requests/queryKeys'
import { useDismiss } from '@/hooks/useDismiss'
import { cn } from '@/lib/cn'
import { formatTimeAgo } from '@/lib/formatTimeAgo'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// payload로 문구를 만들 수 없고 서버 문구도 없을 때 보여줄 기본 문구
const DEFAULT_MESSAGE: Record<NotificationType, string> = {
  NEW_REQUEST: '새로운 견적 요청이 도착했어요',
  NEW_QUOTE: '새로운 견적이 도착했어요',
  QUOTE_CONFIRMED: '견적이 확정되었어요',
  MOVE_DAY: '내일은 이사 예정일이에요',
  NEW_DESIGNATED_REQUEST: '새로운 지정 견적 요청이 도착했어요',
}

const ITEM = 'flex gap-2 px-4 py-4 md:px-6'

function MessageText({ parts }: { parts: MessagePart[] }) {
  return parts.map(({ text, highlight }, index) =>
    highlight ? (
      <span key={index} className="text-primary-400">
        {text}
      </span>
    ) : (
      text
    ),
  )
}

function NotificationMessage({
  notification,
  role,
}: {
  notification: Notification
  role: Role
}) {
  const parts = toMessageParts(notification, role)
  if (!parts) {
    return notification.message || DEFAULT_MESSAGE[notification.type]
  }

  return <MessageText parts={parts} />
}

function NotificationRow({
  notificationId,
  href,
  onNavigate,
  createdAt,
  unread,
  children,
}: {
  notificationId: string
  href: string | null
  onNavigate: (href: string, notificationId: string) => void
  createdAt: string
  unread: boolean
  children: ReactNode
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 font-medium break-keep text-black-400 md:text-base md:leading-7">
          {children}
        </p>
        <time
          dateTime={createdAt}
          className="mt-1 block text-xs text-gray-300 md:text-sm"
        >
          {formatTimeAgo(createdAt)}
        </time>
      </div>
      {unread && (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary-400 md:mt-2.5">
          <span className="sr-only">읽지 않은 알림</span>
        </span>
      )}
    </>
  )

  return (
    <li data-unread-id={unread ? notificationId : undefined}>
      {href ? (
        <Link
          href={href}
          onClick={() => onNavigate(href, notificationId)}
          className={cn(
            ITEM,
            'rounded-lg transition-colors hover:bg-background-200',
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={ITEM}>{content}</div>
      )}
    </li>
  )
}

function PanelStatus({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-gray-400 md:text-base">
      {children}
    </p>
  )
}

export default function NotificationMenu({ role }: { role: Role }) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const loadMoreRef = useRef<HTMLLIElement>(null)
  const panelId = useId()
  const titleId = useId()
  const { hasUnread } = useUnreadNotificationCount()
  const { mutate: readNotifications } = useReadNotifications()
  const { mutate: readAllNotifications, isPending: isReadingAll } =
    useReadAllNotifications()
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
  const shownUnreadIds = useMemo(
    () => notifications.filter(({ readAt }) => !readAt).map(({ id }) => id),
    [notifications],
  )

  const seenUnreadIds = useRef(new Set<string>())

  useEffect(() => {
    const list = listRef.current
    if (!isOpen || !list || shownUnreadIds.length === 0) return

    const seen = seenUnreadIds.current
    const minimumVisibleRatio = 0.5
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < minimumVisibleRatio) continue

          const id = entry.target.getAttribute('data-unread-id')
          if (id) seen.add(id)
        }
      },
      { threshold: minimumVisibleRatio },
    )
    list.querySelectorAll('[data-unread-id]').forEach((row) => {
      observer.observe(row)
    })
    return () => observer.disconnect()
  }, [isOpen, shownUnreadIds])

  const close = useCallback(
    (clickedId?: string) => {
      const idsToRead = shownUnreadIds.filter(
        (id) => id === clickedId || seenUnreadIds.current.has(id),
      )
      seenUnreadIds.current = new Set()
      setIsOpen(false)
      if (idsToRead.length > 0) readNotifications(idsToRead)
    },
    [shownUnreadIds, readNotifications],
  )

  const navigate = (href: string, notificationId: string) => {
    if (href === '/mover/requests') {
      void queryClient.invalidateQueries({
        queryKey: receivedRequestKeys.all,
      })
    }
    close(notificationId)
  }

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
      return <PanelStatus>알림이 없습니다</PanelStatus>
    }

    return (
      <ul
        ref={listRef}
        className="max-h-90 divide-y divide-line-200 overflow-y-auto px-2 md:max-h-100 md:px-4"
      >
        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notificationId={notification.id}
            href={getNotificationHref(notification, role)}
            onNavigate={navigate}
            createdAt={notification.createdAt}
            unread={!notification.readAt}
          >
            <NotificationMessage notification={notification} role={role} />
          </NotificationRow>
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
        className="relative -m-1.5 flex rounded-lg p-1.5 transition-colors hover:bg-background-300 aria-expanded:bg-background-300"
      >
        <Image
          src="/assets/icons/alarm.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 lg:size-9"
        />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white lg:size-3" />
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => readAllNotifications()}
                disabled={
                  isReadingAll || (!hasUnread && shownUnreadIds.length === 0)
                }
                className="text-sm font-semibold text-black-100 disabled:text-gray-400"
              >
                모두 읽음
              </button>
              <button
                type="button"
                aria-label="알림 닫기"
                onClick={() => {
                  close()
                  triggerRef.current?.focus()
                }}
                className="-m-1 flex items-center justify-center rounded-full p-1 transition-colors hover:bg-background-300"
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
          </div>
          {renderContent()}
        </section>
      )}
    </div>
  )
}
