'use client'

import { ChevronRight } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import Modal from '@/components/common/modal/Modal'
import ScheduleBoard from '@/components/mover/schedule/ScheduleBoard'
import ScheduleCard from '@/components/mover/schedule/ScheduleCard'
import {
  ScheduleLoadError,
  ScheduleLoading,
} from '@/components/mover/schedule/ScheduleStatus'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import { getUpcoming } from '@/features/schedule/lib/schedule'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'

// 마이페이지가 길어지지 않게 가까운 일정만 보여준다.
const MAX_UPCOMING = 2

type UpcomingScheduleProps = {
  // 오늘 'YYYY-MM-DD'. 기본은 한국 시간 기준 오늘이다.
  today?: string
  className?: string
}

const EMPTY_MESSAGE =
  'rounded-xl bg-background-200 px-4 py-6 text-center text-sm text-gray-500'

// 모바일에서 달력 대신 보여주는 다가오는 이사 일정. 전체 일정은 바텀시트의 달력으로 본다.
export default function UpcomingSchedule({
  today = todayInSeoul(),
  className,
}: UpcomingScheduleProps) {
  const titleId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const { confirmedQuotes, hasData, isPending, isError, refetch } =
    useConfirmedSchedule()
  const upcoming = useMemo(
    () => getUpcoming(confirmedQuotes, today).slice(0, MAX_UPCOMING),
    [confirmedQuotes, today],
  )

  function renderContent() {
    if (isPending) return <ScheduleLoading />
    // 다시 불러오기만 실패했다면 이미 받은 일정을 그대로 보여준다.
    if (isError && !hasData) {
      return <ScheduleLoadError onRetry={() => refetch()} />
    }
    if (confirmedQuotes.length === 0) {
      return <p className={EMPTY_MESSAGE}>아직 확정된 이사 일정이 없어요</p>
    }
    if (upcoming.length === 0) {
      return <p className={EMPTY_MESSAGE}>앞으로 예정된 이사 일정이 없어요</p>
    }

    return (
      <ul className="flex flex-col gap-3">
        {upcoming.map((quote) => (
          <li key={quote.id}>
            <ScheduleCard quote={quote} today={today} />
          </li>
        ))}
      </ul>
    )
  }

  // 지난 일정만 있어도 달력으로 볼 수 있도록, 확정된 일정이 하나라도 있으면 버튼을 보여준다.
  const canOpenAll = hasData && confirmedQuotes.length > 0

  return (
    <section aria-labelledby={titleId} className={cn(className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          id={titleId}
          className="text-base leading-6 font-semibold text-black-400"
        >
          이사 일정
        </h2>
        {canOpenAll && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setIsOpen(true)}
            className="-mr-1 flex items-center gap-0.5 rounded-lg px-1 py-1 text-sm font-semibold text-primary-400 transition-colors hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:outline-none"
          >
            전체 일정 보기
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      {renderContent()}

      {canOpenAll && (
        <Modal open={isOpen} onClose={() => setIsOpen(false)} title="이사 일정">
          <ScheduleBoard confirmedQuotes={confirmedQuotes} today={today} />
        </Modal>
      )}
    </section>
  )
}
