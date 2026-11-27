import { useId } from 'react'
import ScheduleCard from '@/components/mover/schedule/ScheduleCard'
import { formatMoveDate } from '@/features/received-requests/format'
import type { SentQuote } from '@/features/sent-quotes/api'

type ScheduleDayListProps = {
  // 선택한 날짜 'YYYY-MM-DD'
  dateKey: string
  // 그날 이사하는 확정 견적
  quotes: SentQuote[]
  today?: string
}

// 달력에서 고른 날짜의 이사 일정. 일정이 없는 날도 안내를 보여준다.
export default function ScheduleDayList({
  dateKey,
  quotes,
  today,
}: ScheduleDayListProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <h3
        id={titleId}
        className="text-sm font-semibold text-black-400 lg:text-base"
      >
        {formatMoveDate(dateKey)}
        <span className="ml-2 font-medium text-gray-500">
          {quotes.length > 0 ? `${quotes.length}건` : null}
        </span>
      </h3>

      {quotes.length === 0 ? (
        <p className="mt-3 rounded-xl bg-background-200 px-4 py-6 text-center text-sm text-gray-500">
          이 날은 확정된 이사 일정이 없어요
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <ScheduleCard quote={quote} today={today} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
