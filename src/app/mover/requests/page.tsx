'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { FileText, LoaderCircle, MoveRight, Pencil } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/button/Button'
import { MOVE_TYPE, type MoveType } from '@/components/common/modal/Modal'
import {
  getReceivedRequests,
  type ReceivedRequest,
  type ReceivedRequestQuery,
} from '@/features/received-requests/api'
import { receivedRequestKeys } from '@/features/received-requests/queryKeys'
import { cn } from '@/lib/cn'

// TODO(#82): 검색 · 필터 · 정렬이 생기면 이 값을 화면에서 바꾼다.
const QUERY: ReceivedRequestQuery = {}

// 헤더와 왼쪽 끝을 맞춘다. 데스크톱은 가운데 1200px이다.
const CONTAINER = 'mx-auto w-full max-w-310 px-6 md:px-18 lg:px-5'

const CARD_BUTTON = 'h-12 w-full text-base lg:h-13 lg:w-full lg:text-base'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// '2024-07-01' → '2024년 07월 01일 (월)'
function formatMoveDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  // 'YYYY-MM-DD'를 new Date에 그대로 넣으면 UTC로 읽혀 날짜가 하루 밀릴 수 있다.
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()]
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${year}년 ${pad(month)}월 ${pad(day)}일 (${weekday})`
}

// 요청이 들어온 뒤 얼마나 지났는지 '1시간 전'처럼 보여준다.
function formatTimeAgo(dateTime: string) {
  const diff = Math.max(0, Date.now() - new Date(dateTime).getTime())
  if (diff < MINUTE) return '방금 전'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  return `${Math.floor(diff / DAY)}일 전`
}

// '서울특별시 중구 세종대로 110' → '서울특별시 중구'
// TODO: 시안처럼 '서울시 중구'로 줄일지 지역 단위가 정해지면 맞추기
function toShortAddress(address: string) {
  return address.split(' ').slice(0, 2).join(' ')
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-gray-500 lg:text-sm">{label}</dt>
      <dd className="text-sm font-semibold text-black-400 lg:text-base">
        {value}
      </dd>
    </div>
  )
}

function RequestCard({ request }: { request: ReceivedRequest }) {
  const { label, icon } = MOVE_TYPE[request.moveType.toLowerCase() as MoveType]
  const name = request.customerName
    ? `${request.customerName} 고객님`
    : '고객님'

  return (
    <article className="rounded-2xl border border-line-100 bg-white px-5 py-6 shadow-sm lg:px-6 lg:py-7">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge icon={icon}>{label}</Badge>
          {request.isDesignated && (
            <Badge icon={<FileText className="size-3.5 md:size-4" />}>
              지정 견적 요청
            </Badge>
          )}
        </div>
        <time
          dateTime={request.createdAt}
          className="shrink-0 text-xs text-gray-500 lg:text-sm"
        >
          {formatTimeAgo(request.createdAt)}
        </time>
      </div>

      <h2 className="mt-3 border-b border-line-100 pb-3 text-base font-semibold text-black-400 lg:mt-4 lg:pb-4 lg:text-lg">
        {name}
      </h2>

      {/* 모바일은 출발지·도착지 아래에 이사일, 태블릿 이상은 한 줄 양 끝에 둔다. */}
      <dl className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between lg:mt-4">
        <div className="flex items-end gap-3">
          <InfoItem
            label="출발지"
            value={toShortAddress(request.from.address)}
          />
          <MoveRight
            aria-hidden="true"
            className="mb-0.5 size-4 shrink-0 text-gray-500 lg:mb-1"
          />
          <InfoItem label="도착지" value={toShortAddress(request.to.address)} />
        </div>
        <InfoItem label="이사일" value={formatMoveDate(request.moveDate)} />
      </dl>

      {/* 모바일은 견적 보내기가 위, 태블릿 이상은 반려하기가 왼쪽이다. */}
      <div className="mt-5 flex flex-col-reverse gap-2 md:grid md:grid-cols-2 lg:mt-6">
        {/* TODO(#84): 반려요청 모달 연결 */}
        <Button variant="outlined" className={CARD_BUTTON}>
          반려하기
        </Button>
        {/* TODO(#83): 견적 보내기 모달 연결 */}
        <Button
          icon={<Pencil aria-hidden="true" className="size-4 lg:size-5" />}
          className={CARD_BUTTON}
        >
          견적 보내기
        </Button>
      </div>
    </article>
  )
}

function Loading() {
  return (
    <div role="status" className="flex justify-center py-10">
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span className="sr-only">받은 요청을 불러오고 있습니다.</span>
    </div>
  )
}

export default function ReceivedRequestsPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: receivedRequestKeys.list(QUERY),
    queryFn: ({ pageParam }) =>
      getReceivedRequests({ ...QUERY, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  // 목록 끝에 둔 요소가 보이면 다음 페이지를 불러온다.
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage()
      },
      // 끝에 닿기 조금 전에 미리 불러온다.
      { rootMargin: '200px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const requests = data?.pages.flatMap((page) => page.items) ?? []
  const totalCount = data?.pages[0]?.totalCount

  const renderList = () => {
    if (isPending) return <Loading />
    // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
    if (isError && !data) {
      return (
        <div role="alert" className="flex flex-col items-center gap-6 py-20">
          <p className="text-base font-semibold text-black-400 lg:text-lg">
            받은 요청을 불러오지 못했습니다.
          </p>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            className="w-auto px-8 lg:w-auto"
          >
            다시 시도
          </Button>
        </div>
      )
    }
    if (requests.length === 0) {
      // 안내 문구가 이미지 안에 들어 있어서 alt로 같은 문구를 읽어 준다.
      return (
        <div className="flex justify-center py-20 lg:py-32">
          <Image
            src="/assets/images/empty.png"
            alt="아직 받은 요청이 없어요!"
            width={720}
            height={780}
            className="h-auto w-45 md:w-60"
          />
        </div>
      )
    }
    return (
      <>
        <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
        <div ref={loadMoreRef} />
        {isFetchingNextPage && <Loading />}
      </>
    )
  }

  return (
    <>
      <div className="bg-white">
        <h1
          className={cn(
            CONTAINER,
            'py-4 text-lg font-semibold lg:py-8 lg:text-2xl',
          )}
        >
          받은 요청
        </h1>
      </div>

      <div className={cn(CONTAINER, 'pt-2 pb-20 lg:pt-6')}>
        <p className="mt-6 text-sm font-semibold text-black-400 lg:mt-10 lg:text-base">
          {totalCount !== undefined && `전체 ${totalCount}건`}
        </p>

        <div className="mt-4 lg:mt-8">{renderList()}</div>
      </div>
    </>
  )
}
