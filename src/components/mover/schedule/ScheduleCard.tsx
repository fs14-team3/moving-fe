import { MoveRight } from 'lucide-react'
import Link from 'next/link'
import ServiceTypeChip from '@/components/mover/ServiceTypeChip'
import { formatDday, getDaysUntil } from '@/features/schedule/lib/schedule'
import {
  toCustomerName,
  toShortAddress,
} from '@/features/received-requests/format'
import type { SentQuote } from '@/features/sent-quotes/api'
import {
  isMoveCompleted,
  todayInSeoul,
} from '@/features/sent-quotes/lib/status'

type ScheduleCardProps = {
  quote: SentQuote
  // 오늘 'YYYY-MM-DD'. 기본은 한국 시간 기준 오늘이다.
  today?: string
}

// 기사님의 확정된 이사 일정 한 건. 누르면 보낸 견적 상세로 이동한다.
// 달력 옆 좁은 칸에도 들어가도록 작게 만들었다.
export default function ScheduleCard({
  quote,
  today = todayInSeoul(),
}: ScheduleCardProps) {
  const { moveRequest } = quote
  const isCompleted = isMoveCompleted(moveRequest, today)
  const daysUntil = getDaysUntil(moveRequest.moveDate, today)

  return (
    <Link
      href={`/mover/quotes/${quote.id}`}
      className="block rounded-xl border border-line-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        <ServiceTypeChip serviceType={moveRequest.moveType} size="small" />
        {isCompleted ? (
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            이사 완료
          </span>
        ) : (
          <span className="shrink-0 text-xs font-bold text-primary-400">
            {formatDday(daysUntil)}
          </span>
        )}
      </div>

      <p className="mt-2 text-base font-semibold text-black-400">
        {toCustomerName(moveRequest)}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
        <span className="min-w-0 truncate">
          {toShortAddress(moveRequest.from.address)}
        </span>
        <MoveRight aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="min-w-0 truncate">
          {toShortAddress(moveRequest.to.address)}
        </span>
      </p>

      <p className="mt-3 flex items-center justify-between border-t border-line-100 pt-3 text-sm">
        <span className="text-black-300">견적 금액</span>
        <strong className="font-bold text-black-400">
          {quote.price.toLocaleString('ko-KR')}원
        </strong>
      </p>
    </Link>
  )
}
