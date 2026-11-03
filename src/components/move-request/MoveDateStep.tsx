'use client'

import {
  ChevronProps,
  DayButtonProps,
  DayPicker,
  getDefaultClassNames,
} from '@daypicker/react'
import { ko } from '@daypicker/react/locale'
import '@daypicker/react/style.css'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../common/button/Button'

export default function MoveDateStep() {
  const defaultClassNames = getDefaultClassNames()
  const calendarRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function CalendarChevron({ orientation }: ChevronProps) {
    const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
    return <Icon aria-hidden="true" className="text-gray-400" strokeWidth={2} />
  }

  function CalendarDayButton({
    day,
    modifiers,
    children,
    ...props
  }: DayButtonProps) {
    return (
      <button type="button" {...props}>
        <span>{children}</span>
      </button>
    )
  }

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(selectedDate)
    : '이사 예정일 선택하기'

  function handleSelect(date: Date | undefined) {
    setSelectedDate(date)
  }

  return (
    <div ref={calendarRef} className="w-full md:relative md:w-100 md:shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden h-[50px] w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 ${isOpen ? 'border border-primary-400' : ''} md:flex`}
      >
        <Calendar className="size-6 text-primary-400" />

        <span className="ml-2 text-base leading-6 font-medium">
          {formattedDate}
        </span>

        <ChevronDown
          className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`mx-auto w-full rounded-xl bg-gray-50 py-8 md:absolute md:top-full md:left-0 md:z-20 md:mt-4 md:min-h-[442px] md:flex-col md:items-center md:border md:border-gray-200 ${isOpen ? 'md:flex' : 'md:hidden'} `}
      >
        <DayPicker
          locale={ko}
          mode="single"
          navLayout="around"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={{ before: new Date() }}
          formatters={{
            formatCaption: (date) =>
              `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}`,
          }}
          components={{
            Chevron: CalendarChevron,
            DayButton: CalendarDayButton,
          }}
          className="w-full [--rdp-day-height:48px] [--rdp-day-width:48px] [--rdp-day_button-border-radius:12px] [--rdp-day_button-border:none] [--rdp-day_button-height:48px] [--rdp-day_button-width:48px] [--rdp-nav-height:32px] [--rdp-nav_button-height:32px] [--rdp-nav_button-width:32px]"
          classNames={{
            months: `${defaultClassNames.months} mx-auto w-full! max-w-[336px]!`,

            month: `${defaultClassNames.month} flex w-full flex-wrap items-center justify-center gap-x-[6px]`,

            button_previous: `${defaultClassNames.button_previous} static!`,
            month_caption: `${defaultClassNames.month_caption} m-0! h-8 w-auto`,
            caption_label: `${defaultClassNames.caption_label} text-xl font-semibold leading-8`,
            button_next: `${defaultClassNames.button_next} static!`,

            month_grid: `${defaultClassNames.month_grid} mt-6 w-full basis-full table-fixed`,

            weekday: `${defaultClassNames.weekday} h-12 text-base font-medium leading-6 text-gray-400`,
            today: '',
            day: `${defaultClassNames.day} h-12 w-auto! text-base font-medium`,
            day_button: `${defaultClassNames.day_button} flex! h-full! w-full! items-center justify-center p-0`,
            selected: 'rounded-xl bg-primary-400 font-semibold text-white',
            disabled: 'text-gray-300',
          }}
        />
        <Button
          type="button"
          disabled={!selectedDate}
          onClick={() => setIsOpen(false)}
          className="mt-6 hidden md:flex md:h-[54px] md:w-[279px] lg:h-[54px] lg:w-[279px]"
        >
          선택 완료
        </Button>
      </div>
    </div>
  )
}
