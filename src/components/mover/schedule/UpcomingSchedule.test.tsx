import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UpcomingSchedule from '@/components/mover/schedule/UpcomingSchedule'
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

describe('UpcomingSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // jsdom에는 dialog의 showModal이 없어서 열림 여부만 흉내 낸다.
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
    HTMLDialogElement.prototype.close = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.removeAttribute('open')
    })
    mockSchedule()
  })

  it('이사 일정 제목을 보여준다', () => {
    render(<UpcomingSchedule today={TODAY} />)

    expect(
      screen.getByRole('heading', { level: 2, name: '이사 일정' }),
    ).toBeInTheDocument()
  })

  it('불러오는 동안에는 로딩을 보여주고 전체 일정 보기 버튼은 숨긴다', () => {
    mockSchedule({ isPending: true, hasData: false })

    render(<UpcomingSchedule today={TODAY} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '이사 일정을 불러오고 있습니다.',
    )
    expect(
      screen.queryByRole('button', { name: /전체 일정 보기/ }),
    ).not.toBeInTheDocument()
  })

  it('처음부터 불러오지 못하면 오류를 보여주고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup()
    mockSchedule({ isError: true, hasData: false })

    render(<UpcomingSchedule today={TODAY} />)

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

    render(<UpcomingSchedule today={TODAY} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('김코드 고객님')).toBeInTheDocument()
  })

  it('확정된 일정이 하나도 없으면 안내만 보여주고 전체 일정 보기 버튼은 숨긴다', () => {
    render(<UpcomingSchedule today={TODAY} />)

    expect(
      screen.getByText('아직 확정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /전체 일정 보기/ }),
    ).not.toBeInTheDocument()
  })

  it('앞으로 일정이 있으면 가장 가까운 2건만 가까운 순서로 보여준다', () => {
    mockSchedule({
      confirmedQuotes: [
        createQuote('c', '2026-12-10', '세번째'),
        createQuote('past', '2026-11-20', '지난고객'),
        createQuote('a', '2026-11-27', '첫번째'),
        createQuote('b', '2026-12-01', '두번째'),
      ],
    })

    render(<UpcomingSchedule today={TODAY} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('첫번째 고객님')).toBeInTheDocument()
    expect(within(items[1]).getByText('두번째 고객님')).toBeInTheDocument()
    expect(screen.queryByText('세번째 고객님')).not.toBeInTheDocument()
    expect(screen.queryByText('지난고객 고객님')).not.toBeInTheDocument()
  })

  it('카드에 D-day를 보여주고 누르면 견적 상세로 이동한다', () => {
    mockSchedule({
      confirmedQuotes: [createQuote('quote-9', '2026-11-29')],
    })

    render(<UpcomingSchedule today={TODAY} />)

    expect(screen.getByText('D-3')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/mover/quotes/quote-9',
    )
  })

  it('오늘 일정은 D-DAY로 보여준다', () => {
    mockSchedule({ confirmedQuotes: [createQuote('1', TODAY)] })

    render(<UpcomingSchedule today={TODAY} />)

    expect(screen.getByText('D-DAY')).toBeInTheDocument()
  })

  it('앞으로 일정이 없고 지난 일정만 있으면 안내와 함께 전체 일정 보기 버튼을 보여준다', () => {
    mockSchedule({ confirmedQuotes: [createQuote('past', '2026-11-20')] })

    render(<UpcomingSchedule today={TODAY} />)

    expect(
      screen.getByText('앞으로 예정된 이사 일정이 없어요'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /전체 일정 보기/ }),
    ).toBeInTheDocument()
  })

  it('전체 일정 보기를 누르면 시트에 달력과 선택한 날의 일정이 나온다', async () => {
    const user = userEvent.setup()
    mockSchedule({
      confirmedQuotes: [
        createQuote('a', '2026-11-27', '첫번째'),
        createQuote('b', '2026-11-30', '세번째'),
      ],
    })

    const { container } = render(<UpcomingSchedule today={TODAY} />)
    expect(container.querySelector('[data-day]')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /전체 일정 보기/ }))

    const sheet = screen.getByRole('dialog', { name: '이사 일정' })
    expect(sheet.querySelector('[data-day="2026-11-27"]')).toBeInTheDocument()
    // 처음에는 가장 가까운 일정 날짜가 선택돼 있다.
    expect(
      screen.getAllByRole('heading', { name: /2026년 11월 27일/ }),
    ).toHaveLength(1)
  })

  it('시트에서 지난 일정도 달력으로 볼 수 있다', async () => {
    const user = userEvent.setup()
    mockSchedule({ confirmedQuotes: [createQuote('past', '2026-11-20')] })

    render(<UpcomingSchedule today={TODAY} />)
    await user.click(screen.getByRole('button', { name: /전체 일정 보기/ }))

    const sheet = screen.getByRole('dialog', { name: '이사 일정' })
    const day = sheet.querySelector<HTMLButtonElement>(
      '[data-day="2026-11-20"] button',
    )
    expect(day).toHaveAccessibleName(/이사 일정 1건/)
    await user.click(day!)

    expect(
      within(sheet).getByRole('heading', { name: /2026년 11월 20일/ }),
    ).toBeInTheDocument()
    expect(within(sheet).getByText('이사 완료')).toBeInTheDocument()
  })

  it('시트를 닫으면 내용을 지운다', async () => {
    const user = userEvent.setup()
    mockSchedule({ confirmedQuotes: [createQuote('a', '2026-11-27')] })

    const { container } = render(<UpcomingSchedule today={TODAY} />)
    await user.click(screen.getByRole('button', { name: /전체 일정 보기/ }))
    expect(container.querySelector('[data-day]')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '닫기' }))

    expect(container.querySelector('[data-day]')).not.toBeInTheDocument()
  })
})
