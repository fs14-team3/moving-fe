'use client'

import { useMemo, useState } from 'react'
import ScheduleCalendar from '@/components/mover/schedule/ScheduleCalendar'
import ScheduleDayList from '@/components/mover/schedule/ScheduleDayList'
import { getUpcoming, groupByMoveDate } from '@/features/schedule/lib/schedule'
import type { SentQuote } from '@/features/sent-quotes/api'

type ScheduleBoardProps = {
  // 기사님의 확정된 견적 전체
  confirmedQuotes: SentQuote[]
  // 오늘 'YYYY-MM-DD'
  today: string
}

// 달력과, 달력에서 고른 날짜의 일정 목록. 일정 섹션과 모바일 바텀시트가 함께 쓴다.
// 처음에는 앞으로 가장 가까운 일정 날짜를 선택해서 보여준다.
export default function ScheduleBoard({
  confirmedQuotes,
  today,
}: ScheduleBoardProps) {
  // 사용자가 직접 고른 날짜. 아직 고르지 않았다면 기본 날짜를 쓴다.
  const [pickedDate, setPickedDate] = useState<string>()

  const quotesByDate = useMemo(
    () => groupByMoveDate(confirmedQuotes),
    [confirmedQuotes],
  )
  const counts = useMemo(
    () =>
      new Map(
        [...quotesByDate].map(([dateKey, quotes]) => [dateKey, quotes.length]),
      ),
    [quotesByDate],
  )
  // 앞으로 일정이 있으면 가장 가까운 날, 없으면 오늘
  const defaultDate =
    getUpcoming(confirmedQuotes, today)[0]?.moveRequest.moveDate ?? today
  const selectedDate = pickedDate ?? defaultDate

  // 태블릿(md ~ lg 미만)은 달력 옆에 그날의 일정을 두고, 모바일과 데스크톱은 위아래로 쌓는다.
  return (
    <div className="flex flex-col gap-5 md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:gap-8 lg:flex lg:flex-col lg:gap-5">
      <ScheduleCalendar
        counts={counts}
        selectedDate={selectedDate}
        onSelect={setPickedDate}
        today={today}
      />
      {confirmedQuotes.length === 0 ? (
        <p className="rounded-xl bg-background-200 px-4 py-6 text-center text-sm text-gray-500">
          아직 확정된 이사 일정이 없어요
        </p>
      ) : (
        <ScheduleDayList
          dateKey={selectedDate}
          quotes={quotesByDate.get(selectedDate) ?? []}
          today={today}
        />
      )}
    </div>
  )
}
