'use client'

import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButtonProps,
} from '@daypicker/react'
import { ko } from '@daypicker/react/locale'
import '@daypicker/react/style.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createContext, useContext, useState } from 'react'
import { fromDateKey, toDateKey } from '@/features/schedule/lib/schedule'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'

type ScheduleCalendarProps = {
  // 날짜별 이사 일정 수. 키는 'YYYY-MM-DD'이고 일정이 없는 날은 넣지 않는다.
  counts: ReadonlyMap<string, number>
  // 선택한 날짜 'YYYY-MM-DD'. 처음 보여줄 달도 이 날짜를 따른다.
  selectedDate?: string
  onSelect: (dateKey: string) => void
  // 오늘 'YYYY-MM-DD'. 기본은 한국 시간 기준 오늘이다.
  today?: string
  className?: string
}

// 날짜 칸 안에서 그날의 일정 수를 알아야 하는데, 칸 컴포넌트는 라이브러리가 만들어서 context로 넘긴다.
const CountsContext = createContext<ReadonlyMap<string, number>>(new Map())

function CalendarChevron({ orientation }: ChevronProps) {
  const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
  return (
    <Icon aria-hidden="true" className="size-5 text-gray-400" strokeWidth={2} />
  )
}

// 일정이 1건이면 점, 2건 이상이면 오른쪽 위에 숫자를 붙인다.
// 기본 DayButton을 감싸서 키보드로 날짜를 옮길 때의 포커스 처리는 그대로 둔다.
function ScheduleDayButton({ children, ...props }: DayButtonProps) {
  const count = useContext(CountsContext).get(props.day.isoDate) ?? 0
  const { selected, past } = props.modifiers
  const label = props['aria-label']

  return (
    <DayButton
      {...props}
      aria-label={count > 0 ? `${label}, 이사 일정 ${count}건` : label}
      className={cn(props.className, 'relative')}
    >
      {children}
      {count === 1 && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full',
            selected ? 'bg-white' : past ? 'bg-gray-400' : 'bg-primary-400',
          )}
        />
      )}
      {count >= 2 && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0 right-0 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-semibold',
            selected
              ? 'bg-white text-primary-400'
              : past
                ? 'bg-gray-400 text-white'
                : 'bg-primary-400 text-white',
          )}
        >
          {count}
        </span>
      )}
    </DayButton>
  )
}

// 기사님의 이사 일정을 보여주는 달력. 일정 데이터는 props로만 받는다.
// 지난 날짜도 눌러서 볼 수 있다. 이미 끝난 이사를 다시 확인할 수 있어야 해서 비활성으로 막지 않는다.
export default function ScheduleCalendar({
  counts,
  selectedDate,
  onSelect,
  today = todayInSeoul(),
  className,
}: ScheduleCalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const [month, setMonth] = useState(() => fromDateKey(selectedDate ?? today))
  const todayDate = fromDateKey(today)

  return (
    <CountsContext.Provider value={counts}>
      <DayPicker
        locale={ko}
        mode="single"
        required
        navLayout="around"
        month={month}
        onMonthChange={setMonth}
        today={todayDate}
        selected={selectedDate ? fromDateKey(selectedDate) : undefined}
        onSelect={(date) => onSelect(toDateKey(date))}
        formatters={{
          formatCaption: (date) =>
            `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}`,
        }}
        components={{ Chevron: CalendarChevron, DayButton: ScheduleDayButton }}
        modifiers={{ past: { before: todayDate } }}
        className={cn(
          'w-full [--rdp-day-height:40px] [--rdp-day-width:40px] [--rdp-day_button-border-radius:12px] [--rdp-day_button-border:none] [--rdp-day_button-height:40px] [--rdp-day_button-width:40px] [--rdp-nav-height:32px] [--rdp-nav_button-height:32px] [--rdp-nav_button-width:32px]',
          className,
        )}
        classNames={{
          months: `${defaultClassNames.months} mx-auto w-full! max-w-[280px]!`,
          month: `${defaultClassNames.month} flex w-full flex-wrap items-center justify-center gap-x-[6px]`,
          button_previous: `${defaultClassNames.button_previous} static!`,
          month_caption: `${defaultClassNames.month_caption} m-0! h-8 w-auto`,
          caption_label: `${defaultClassNames.caption_label} text-base font-semibold leading-8`,
          button_next: `${defaultClassNames.button_next} static!`,
          month_grid: `${defaultClassNames.month_grid} mt-4 w-full basis-full table-fixed`,
          weekday: `${defaultClassNames.weekday} h-10 text-sm font-medium leading-6 text-gray-400`,
          day: `${defaultClassNames.day} h-10 w-auto! text-sm font-medium`,
          day_button: `${defaultClassNames.day_button} flex! h-full! w-full! items-center justify-center p-0 hover:rounded-xl! hover:bg-primary-100! in-data-selected:hover:bg-transparent!`,
          today: 'rounded-xl border border-primary-400',
          selected:
            'rounded-xl bg-primary-400 font-semibold text-white hover:bg-primary-400 in-data-selected:hover:bg-transparent',
        }}
        modifiersClassNames={{ past: 'text-gray-400' }}
      />
    </CountsContext.Provider>
  )
}
