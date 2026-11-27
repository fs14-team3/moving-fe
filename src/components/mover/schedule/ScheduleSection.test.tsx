import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleSection from '@/components/mover/schedule/ScheduleSection'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import type { SentQuote } from '@/features/sent-quotes/api'

vi.mock('@/features/schedule/hooks/useConfirmedSchedule', () => ({
  useConfirmedSchedule: vi.fn(),
}))

const TODAY = '2026-11-26'
const refetch = vi.fn()

function createQuote(
  id: string,
  moveDate: string,
  customerName = '김코드',
): SentQuote {
  return {
    id,
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: `request-${id}`,
      customerName,
      moveType: 'SMALL',
      moveDate,
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

function mockSchedule(
  state: Partial<ReturnType<typeof useConfirmedSchedule>> = {},
) {
  vi.mocked(useConfirmedSchedule).mockReturnValue({
    confirmedQuotes: [],
    hasData: true,
    isPending: false,
    isError: false,
    refetch,
    ...state,
  })
}

function getDay(container: HTMLElement, dateKey: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `[data-day="${dateKey}"] button`,
  )
  if (!button) throw new Error(`${dateKey} 날짜 칸이 없습니다.`)
  return button
}

describe('ScheduleSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSchedule()
  })

  it('이사 일정 제목을 보여준다', () => {
    render(<ScheduleSection today={TODAY} />)

    expect(
      screen.getByRole('heading', { level: 2, name: '이사 일정' }),
    ).toBeInTheDocument()
  })

  it('불러오는 동안에는 로딩을 보여주고 달력은 그리지 않는다', () => {
    mockSchedule({ isPending: true, hasData: false })

    const { container } = render(<ScheduleSection today={TODAY} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '이사 일정을 불러오고 있습니다.',
    )
    expect(container.querySelector('[data-day]')).not.toBeInTheDocument()
  })

  it('처음부터 불러오지 못하면 오류를 보여주고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup()
    mockSchedule({ isError: true, hasData: false })

    render(<ScheduleSection today={TODAY} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이사 일정을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('다시 불러오기만 실패하면 이미 받은 일정을 그대로 보여준다', () => {
    mockSchedule({
      isError: true,
      hasData: true,
      confirmedQuotes: [createQuote('1', '2026-11-29')],
    })

    render(<ScheduleSection today={TODAY} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('김코드 고객님')).toBeInTheDocument()
  })

  it('확정된 일정이 하나도 없으면 안내를 보여준다', () => {
    render(<ScheduleSection today={TODAY} />)

    expect(
      screen.getByText('아직 확정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('처음에는 앞으로 가장 가까운 일정 날짜를 보여준다', () => {
    mockSchedule({
      confirmedQuotes: [
        createQuote('late', '2026-11-30', '박이사'),
        createQuote('past', '2026-11-20', '지난고객'),
        createQuote('soon', '2026-11-29', '이가까'),
      ],
    })

    render(<ScheduleSection today={TODAY} />)

    expect(
      screen.getByRole('heading', { name: /2026년 11월 29일/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('이가까 고객님')).toBeInTheDocument()
    expect(screen.queryByText('박이사 고객님')).not.toBeInTheDocument()
    expect(screen.queryByText('지난고객 고객님')).not.toBeInTheDocument()
  })

  it('앞으로 일정이 없고 지난 일정만 있으면 오늘을 보여준다', () => {
    mockSchedule({ confirmedQuotes: [createQuote('past', '2026-11-20')] })

    render(<ScheduleSection today={TODAY} />)

    expect(
      screen.getByRole('heading', { name: /2026년 11월 26일/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('이 날은 확정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
  })

  it('다른 날짜를 누르면 그날의 일정으로 바뀐다', async () => {
    const user = userEvent.setup()
    mockSchedule({
      confirmedQuotes: [
        createQuote('a', '2026-11-29', '이가까'),
        createQuote('b', '2026-11-30', '박이사'),
        createQuote('c', '2026-11-30', '최이삿'),
      ],
    })

    const { container } = render(<ScheduleSection today={TODAY} />)
    expect(screen.getByText('이가까 고객님')).toBeInTheDocument()

    await user.click(getDay(container, '2026-11-30'))

    expect(
      screen.getByRole('heading', { name: /2026년 11월 30일/ }),
    ).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('박이사 고객님')).toBeInTheDocument()
    expect(screen.queryByText('이가까 고객님')).not.toBeInTheDocument()
  })

  it('일정이 없는 날짜를 누르면 일정 없음 안내를 보여준다', async () => {
    const user = userEvent.setup()
    mockSchedule({ confirmedQuotes: [createQuote('a', '2026-11-29')] })

    const { container } = render(<ScheduleSection today={TODAY} />)
    await user.click(getDay(container, '2026-11-27'))

    expect(
      screen.getByText('이 날은 확정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
  })

  it('달력의 날짜마다 그날의 일정 수를 알려준다', () => {
    mockSchedule({
      confirmedQuotes: [
        createQuote('a', '2026-11-29'),
        createQuote('b', '2026-11-30'),
        createQuote('c', '2026-11-30'),
      ],
    })

    const { container } = render(<ScheduleSection today={TODAY} />)

    expect(getDay(container, '2026-11-29')).toHaveAccessibleName(
      /이사 일정 1건/,
    )
    expect(getDay(container, '2026-11-30')).toHaveAccessibleName(
      /이사 일정 2건/,
    )
    expect(getDay(container, '2026-11-28')).not.toHaveAccessibleName(
      /이사 일정/,
    )
  })
})
