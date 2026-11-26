'use client'

import { LoaderCircle } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import Button from '@/components/common/button/Button'
import ScheduleCalendar from '@/components/mover/schedule/ScheduleCalendar'
import ScheduleDayList from '@/components/mover/schedule/ScheduleDayList'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import { getUpcoming, groupByMoveDate } from '@/features/schedule/lib/schedule'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'

type ScheduleSectionProps = {
  // 오늘 'YYYY-MM-DD'. 기본은 한국 시간 기준 오늘이다.
  today?: string
  className?: string
}

// 마이페이지의 좁은 칸에 들어가도록 페이지용 로딩 · 오류 화면보다 작게 만들었다.
function Loading() {
  return (
    <div role="status" className="flex justify-center py-8">
      <LoaderCircle
        aria-hidden="true"
        className="size-6 animate-spin text-primary-400"
      />
      <span className="sr-only">이사 일정을 불러오고 있습니다.</span>
    </div>
  )
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6">
      <p className="text-sm font-semibold text-black-400">
        이사 일정을 불러오지 못했습니다.
      </p>
      <Button
        variant="outlined"
        onClick={onRetry}
        className="h-9 w-auto px-5 text-sm lg:h-9 lg:w-auto lg:text-sm"
      >
        다시 시도
      </Button>
    </div>
  )
}

// 기사님의 확정된 이사 일정을 달력과 날짜별 목록으로 보여준다.
// 처음에는 앞으로 가장 가까운 일정 날짜를 선택해서 보여준다.
export default function ScheduleSection({
  today = todayInSeoul(),
  className,
}: ScheduleSectionProps) {
  const titleId = useId()
  const { confirmedQuotes, hasData, isPending, isError, refetch } =
    useConfirmedSchedule()
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

  function renderContent() {
    if (isPending) return <Loading />
    // 다시 불러오기만 실패했다면 이미 받은 일정을 그대로 보여준다.
    if (isError && !hasData) return <LoadError onRetry={() => refetch()} />

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

  return (
    <section aria-labelledby={titleId} className={cn(className)}>
      <h2
        id={titleId}
        className="mb-3 text-base leading-6 font-semibold text-black-400 md:mb-4 md:text-xl md:leading-8"
      >
        이사 일정
      </h2>
      {renderContent()}
    </section>
  )
}
