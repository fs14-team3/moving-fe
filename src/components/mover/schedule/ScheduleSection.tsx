'use client'

import { useId } from 'react'
import ScheduleBoard from '@/components/mover/schedule/ScheduleBoard'
import {
  ScheduleLoadError,
  ScheduleLoading,
} from '@/components/mover/schedule/ScheduleStatus'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'

type ScheduleSectionProps = {
  // 오늘 'YYYY-MM-DD'. 기본은 한국 시간 기준 오늘이다.
  today?: string
  className?: string
}

// 기사님의 확정된 이사 일정을 달력과 날짜별 목록으로 보여준다.
export default function ScheduleSection({
  today = todayInSeoul(),
  className,
}: ScheduleSectionProps) {
  const titleId = useId()
  const { confirmedQuotes, hasData, isPending, isError, refetch } =
    useConfirmedSchedule()

  function renderContent() {
    if (isPending) return <ScheduleLoading />
    // 다시 불러오기만 실패했다면 이미 받은 일정을 그대로 보여준다.
    if (isError && !hasData) {
      return <ScheduleLoadError onRetry={() => refetch()} />
    }

    return <ScheduleBoard confirmedQuotes={confirmedQuotes} today={today} />
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
