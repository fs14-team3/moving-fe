import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ScheduleCalendar from '@/components/mover/schedule/ScheduleCalendar'

const TODAY = '2026-11-26'

function renderCalendar(
  props: Partial<React.ComponentProps<typeof ScheduleCalendar>> = {},
) {
  const onSelect = vi.fn()
  const view = render(
    <ScheduleCalendar
      counts={new Map()}
      selectedDate="2026-11-26"
      today={TODAY}
      onSelect={onSelect}
      {...props}
    />,
  )

  return { onSelect, ...view }
}

// 날짜 칸(td)은 data-day에 'YYYY-MM-DD'를 가진다.
function getDay(container: HTMLElement, dateKey: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `[data-day="${dateKey}"] button`,
  )
  if (!button) throw new Error(`${dateKey} 날짜 칸이 없습니다.`)
  return button
}

describe('ScheduleCalendar', () => {
  it('선택한 날짜가 있는 달을 연 · 월로 보여준다', () => {
    renderCalendar({ selectedDate: '2026-12-15' })

    expect(screen.getByText('2026. 12')).toBeInTheDocument()
  })

  it('선택한 날짜가 없으면 오늘이 있는 달을 보여준다', () => {
    renderCalendar({ selectedDate: undefined })

    expect(screen.getByText('2026. 11')).toBeInTheDocument()
  })

  it('요일을 한국어로 보여준다', () => {
    renderCalendar()

    expect(screen.getByText('일')).toBeInTheDocument()
    expect(screen.getByText('토')).toBeInTheDocument()
  })

  it('날짜를 누르면 그 날짜를 YYYY-MM-DD로 알려준다', async () => {
    const user = userEvent.setup()
    const { onSelect, container } = renderCalendar()

    await user.click(getDay(container, '2026-11-30'))

    expect(onSelect).toHaveBeenCalledWith('2026-11-30')
  })

  it('이미 선택한 날짜를 다시 눌러도 선택이 풀리지 않는다', async () => {
    const user = userEvent.setup()
    const { onSelect, container } = renderCalendar()

    await user.click(getDay(container, '2026-11-26'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('2026-11-26')
  })

  it('지난 날짜도 누를 수 있다', async () => {
    const user = userEvent.setup()
    const { onSelect, container } = renderCalendar()
    const past = getDay(container, '2026-11-10')

    expect(past).toBeEnabled()
    await user.click(past)

    expect(onSelect).toHaveBeenCalledWith('2026-11-10')
  })

  it('선택한 날짜를 표시한다', () => {
    const { container } = renderCalendar({ selectedDate: '2026-11-18' })

    expect(getDay(container, '2026-11-18').closest('td')).toHaveAttribute(
      'data-selected',
      'true',
    )
    expect(getDay(container, '2026-11-19').closest('td')).not.toHaveAttribute(
      'data-selected',
    )
  })

  it('일정이 1건인 날은 숫자 없이 점으로만 표시하고, 읽어주는 이름에 일정 수를 붙인다', () => {
    const { container } = renderCalendar({
      counts: new Map([['2026-11-30', 1]]),
    })
    const day = getDay(container, '2026-11-30')

    expect(day).toHaveAccessibleName(/이사 일정 1건/)
    expect(day.querySelector('span')).toBeInTheDocument()
    expect(day).toHaveTextContent(/^30$/)
  })

  it('일정이 2건 이상인 날은 일정 수를 숫자로 보여준다', () => {
    const { container } = renderCalendar({
      counts: new Map([['2026-11-30', 3]]),
    })
    const day = getDay(container, '2026-11-30')

    expect(day).toHaveAccessibleName(/이사 일정 3건/)
    expect(day).toHaveTextContent('303')
  })

  it('일정이 없는 날은 일정 표시와 안내가 없다', () => {
    const { container } = renderCalendar({
      counts: new Map([['2026-11-30', 2]]),
    })
    const day = getDay(container, '2026-11-29')

    expect(day).not.toHaveAccessibleName(/이사 일정/)
    expect(day.querySelector('span')).not.toBeInTheDocument()
  })

  it('이전 달 · 다음 달로 넘겨 볼 수 있다', async () => {
    const user = userEvent.setup()
    renderCalendar()

    await user.click(screen.getByRole('button', { name: /다음/ }))
    expect(screen.getByText('2026. 12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /이전/ }))
    await user.click(screen.getByRole('button', { name: /이전/ }))
    expect(screen.getByText('2026. 10')).toBeInTheDocument()
  })

  it('다른 달로 넘겨도 그 달의 일정 표시가 나온다', async () => {
    const user = userEvent.setup()
    const { container } = renderCalendar({
      counts: new Map([['2026-12-05', 2]]),
    })

    await user.click(screen.getByRole('button', { name: /다음/ }))

    expect(getDay(container, '2026-12-05')).toHaveAccessibleName(
      /이사 일정 2건/,
    )
  })
})
