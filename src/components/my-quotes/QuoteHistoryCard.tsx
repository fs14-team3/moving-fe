'use client'

import { CircleCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Dropdown from '@/components/common/dropdown/Dropdown'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import QuoteMoverInfo from '@/components/my-quotes/QuoteMoverInfo'
import type { ServiceType } from '@/constants/services'
import type { CustomerQuote, QuoteHistoryItem } from '@/features/my-quotes/api'
import { formatShortRequestDate } from '@/features/my-quotes/format'
import { formatMoveDate } from '@/features/received-requests/format'
import { cn } from '@/lib/cn'

const FILTER_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '확정견적', value: 'CONFIRMED' },
]

type QuoteFilter = 'ALL' | 'CONFIRMED'

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-sm text-primary-400">{label}</dt>
      <dd className="text-right text-sm font-semibold text-black-400">
        {value}
      </dd>
    </div>
  )
}

// 시안대로 확정되지 않은 견적은 모두 '견적대기'로 보여준다.
function QuoteStatusLabel({
  status,
  className,
}: {
  status: CustomerQuote['status']
  className?: string
}) {
  if (status === 'CONFIRMED') {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-400',
          className,
        )}
      >
        <CircleCheck
          aria-hidden="true"
          className="size-4 fill-primary-400 text-white"
        />
        확정견적
      </span>
    )
  }

  return (
    <span className={cn('shrink-0 text-sm text-gray-400', className)}>
      견적대기
    </span>
  )
}

function HistoryQuoteItem({
  quote,
  moveType,
}: {
  quote: CustomerQuote
  moveType: ServiceType
}) {
  const intro = quote.mover.intro?.trim() || '등록된 소개가 없습니다.'

  return (
    // TODO: 견적 상세 페이지(/my-quotes/[quoteId])를 만들면 이 주소에 연결된다.
    <Link
      href={`/my-quotes/${quote.id}`}
      className="block rounded-xl focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:outline-none"
    >
      <QuoteBadges moveType={moveType} isDesignated={quote.isDesignated} />

      {/* 상태 라벨은 태블릿 이상은 소개 오른쪽, 모바일은 금액 왼쪽에 둔다. */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="line-clamp-1 text-sm font-semibold text-black-400 md:text-base">
          {intro}
        </p>
        <QuoteStatusLabel status={quote.status} className="max-md:hidden" />
      </div>

      <QuoteMoverInfo
        mover={quote.mover}
        badgeClassName="md:hidden"
        className="mt-3 rounded-lg border border-line-200 p-3"
      />

      <div className="mt-3 flex items-center justify-between md:justify-end">
        <QuoteStatusLabel status={quote.status} className="md:hidden" />
        <p className="flex items-center gap-2">
          <span className="text-xs text-gray-500">견적 금액</span>
          <strong className="text-lg font-bold text-black-400 lg:text-xl">
            {quote.price.toLocaleString('ko-KR')}원
          </strong>
        </p>
      </div>
    </Link>
  )
}

// 받았던 견적의 지난 요청 하나. 데스크톱은 왼쪽에 견적 정보, 오른쪽에 견적서 목록을 둔다.
export default function QuoteHistoryCard({
  request,
}: {
  request: QuoteHistoryItem
}) {
  const [filter, setFilter] = useState<QuoteFilter>('ALL')
  // 요청마다 받은 견적이 모두 오므로 확정견적은 화면에서 거른다.
  const quotes =
    filter === 'CONFIRMED'
      ? request.quotes.filter((quote) => quote.status === 'CONFIRMED')
      : request.quotes
  const requestDate = formatShortRequestDate(request.createdAt)

  return (
    <article className="rounded-2xl bg-white px-5 py-6 shadow-sm md:px-6 md:py-8 lg:grid lg:grid-cols-3 lg:p-10">
      <section className="lg:pr-10">
        {/* 모바일은 제목을 가운데, 견적 신청일을 정보 아래에 둔다. */}
        <div className="flex items-center justify-center md:justify-between">
          <h2 className="text-base font-semibold text-black-400 lg:text-lg">
            견적 정보
          </h2>
          <p className="text-sm text-gray-400 max-md:hidden">{requestDate}</p>
        </div>
        <dl className="mt-4 flex flex-col gap-3 md:mt-6 md:gap-4">
          <InfoItem
            label="이사 유형"
            value={MOVE_TYPE[request.moveType].label}
          />
          <InfoItem label="출발지" value={request.from.address} />
          <InfoItem label="도착지" value={request.to.address} />
          <InfoItem label="이사일" value={formatMoveDate(request.moveDate)} />
        </dl>
        <p className="mt-3 text-right text-xs text-gray-400 md:hidden">
          {requestDate}
        </p>
      </section>

      <section className="mt-8 md:mt-10 lg:col-span-2 lg:mt-0 lg:border-l lg:border-line-100 lg:pl-10">
        <h3 className="text-base font-semibold text-black-400 lg:text-lg">
          견적서 목록 <span className="text-primary-400">{quotes.length}</span>
        </h3>
        <div className="mt-3">
          <Dropdown
            variant="service"
            placeholder="전체"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => setFilter(value as QuoteFilter)}
          />
        </div>

        {quotes.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400 lg:text-base">
            {filter === 'CONFIRMED'
              ? '확정한 견적이 없어요'
              : '받은 견적이 없어요'}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-8">
            {quotes.map((quote) => (
              <li key={quote.id}>
                <HistoryQuoteItem quote={quote} moveType={request.moveType} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
