import MyMoverProfile from '@/components/mover/MyMoverProfile'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { MOCK_REVIEWS } from '@/features/movers/fixtures/reviews'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'
import { useMyMover } from '@/features/movers/hooks/useMyMover'
import { useConfirmedSchedule } from '@/features/schedule/hooks/useConfirmedSchedule'
import type { SentQuote } from '@/features/sent-quotes/api'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/features/movers/hooks/useMyMover', () => ({
  useMyMover: vi.fn(),
}))

vi.mock('@/features/movers/hooks/useMoverReviews', () => ({
  useMoverReviews: vi.fn(),
}))

vi.mock('@/features/schedule/hooks/useConfirmedSchedule', () => ({
  useConfirmedSchedule: vi.fn(),
}))

function createScheduleResult(
  overrides: Partial<ReturnType<typeof useConfirmedSchedule>> = {},
) {
  return {
    confirmedQuotes: [],
    hasData: true,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

function createConfirmedQuote(customerName: string): SentQuote {
  return {
    id: 'quote-1',
    price: 180000,
    comment: null,
    status: 'CONFIRMED',
    isDesignated: false,
    createdAt: '2026-11-01T09:00:00.000Z',
    moveRequest: {
      id: 'request-1',
      customerName,
      moveType: 'SMALL',
      moveDate: '2099-12-31',
      details: null,
      from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
      to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
      status: 'CONFIRMED',
      isDesignated: false,
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  }
}

function createReviewsResult(
  overrides: Partial<ReturnType<typeof useMoverReviews>> = {},
) {
  return {
    reviews: MOCK_REVIEWS.slice(0, 5),
    totalCount: 6,
    totalPages: 2,
    isPending: false,
    isFetching: false,
    isError: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

function createMyMoverResult(
  overrides: Partial<ReturnType<typeof useMyMover>> = {},
) {
  return {
    mover: MOCK_MOVER_DETAILS[0],
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

// 화면 크기마다 따로 두는 이사 일정 섹션들. DOM 순서(데스크톱 오른쪽 열 → 태블릿)대로 돌려준다.
function getScheduleSections() {
  return screen
    .getAllByRole('heading', { name: '이사 일정' })
    .map((heading) => heading.closest('section')!)
}

describe('MyMoverProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMyMover).mockReturnValue(createMyMoverResult())
    vi.mocked(useMoverReviews).mockReturnValue(createReviewsResult())
    vi.mocked(useConfirmedSchedule).mockReturnValue(createScheduleResult())
  })

  it('내가 받은 리뷰와 평점을 보여 준다', () => {
    const mover = MOCK_MOVER_DETAILS[0]
    render(<MyMoverProfile />)

    expect(useMoverReviews).toHaveBeenCalledWith(mover.id, {
      page: 1,
      pageSize: 5,
    })
    const reviewSection = screen
      .getByRole('heading', { name: '리뷰' })
      .closest('section')!
    expect(
      within(reviewSection).getByText(mover.averageRating.toFixed(1)),
    ).toBeInTheDocument()
    expect(within(reviewSection).getByText('6개의 리뷰')).toBeInTheDocument()
  })

  it('받은 리뷰가 없으면 리뷰 등록 권유 없이 빈 목록 안내를 보여 준다', () => {
    vi.mocked(useMoverReviews).mockReturnValue(
      createReviewsResult({ reviews: [], totalCount: 0, totalPages: 0 }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByText('아직 등록된 리뷰가 없어요!')).toBeInTheDocument()
    expect(screen.queryByText('가장 먼저 리뷰를 등록해보세요')).toBeNull()
  })

  it('내 프로필과 수정 페이지 링크를 보여 준다', () => {
    render(<MyMoverProfile />)

    expect(screen.getByRole('heading', { name: '김무빙' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '내 프로필 수정' }),
    ).toHaveAttribute('href', '/mover/profile/edit')
    expect(screen.getByRole('link', { name: '기본정보 수정' })).toHaveAttribute(
      'href',
      '/mover/basic-info/edit',
    )
  })

  it('프로필을 불러오는 동안 로딩 상태를 보여 준다', () => {
    vi.mocked(useMyMover).mockReturnValue(
      createMyMoverResult({ mover: undefined, isPending: true }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '내 프로필을 불러오고 있습니다.',
    )
  })

  it('조회에 실패하면 다시 시도한다', async () => {
    const refetch = vi.fn()
    vi.mocked(useMyMover).mockReturnValue(
      createMyMoverResult({ mover: undefined, isError: true, refetch }),
    )
    const user = userEvent.setup()

    render(<MyMoverProfile />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      '내 프로필을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('다시 불러오다 실패해도 불러온 프로필을 계속 보여 준다', () => {
    vi.mocked(useMyMover).mockReturnValue(
      createMyMoverResult({ isError: true }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByRole('heading', { name: '김무빙' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('확정된 이사 일정을 이사 일정 섹션에 보여 준다', () => {
    vi.mocked(useConfirmedSchedule).mockReturnValue(
      createScheduleResult({
        confirmedQuotes: [createConfirmedQuote('박이사')],
      }),
    )

    render(<MyMoverProfile />)

    // 화면 크기별로 일정 섹션을 따로 두기 때문에 여러 개이고, 어느 것이든 같은 일정을 보여준다.
    const schedules = getScheduleSections()
    expect(schedules.length).toBeGreaterThan(0)
    for (const schedule of schedules) {
      expect(within(schedule).getByText('박이사 고객님')).toBeInTheDocument()
    }
  })

  it('이사 일정을 불러오지 못해도 프로필은 그대로 보여 준다', () => {
    vi.mocked(useConfirmedSchedule).mockReturnValue(
      createScheduleResult({ isError: true, hasData: false }),
    )

    render(<MyMoverProfile />)

    expect(screen.getByRole('heading', { name: '김무빙' })).toBeInTheDocument()
    const alerts = screen.getAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
    for (const alert of alerts) {
      expect(alert).toHaveTextContent('이사 일정을 불러오지 못했습니다.')
    }
  })

  // jsdom은 CSS를 적용하지 않아서 화면 크기별 표시는 클래스로 확인한다.
  it('데스크톱 일정은 오른쪽 열에, 태블릿 일정은 활동 현황 아래에 서로 겹치지 않게 둔다', () => {
    render(<MyMoverProfile />)

    const [desktop, tablet] = getScheduleSections()
    expect(desktop).toHaveClass('hidden', 'lg:block', 'lg:col-start-2')
    expect(tablet).toHaveClass('hidden', 'md:block', 'lg:hidden')

    const stats = screen
      .getByRole('heading', { name: '활동 현황' })
      .closest('section')!
    expect(stats.nextElementSibling).toBe(tablet)
  })

  it('모바일에서는 달력 대신 다가오는 일정을 태블릿 일정 바로 아래에 보여준다', () => {
    vi.mocked(useConfirmedSchedule).mockReturnValue(
      createScheduleResult({
        confirmedQuotes: [createConfirmedQuote('박이사')],
      }),
    )

    render(<MyMoverProfile />)

    const [, tablet, mobile] = getScheduleSections()
    expect(mobile).toHaveClass('md:hidden')
    expect(tablet.nextElementSibling).toBe(mobile)
    // 모바일은 달력을 그리지 않고 전체 일정 보기 버튼으로 연다.
    expect(within(mobile).queryByRole('grid')).not.toBeInTheDocument()
    expect(
      within(mobile).getByRole('button', { name: /전체 일정 보기/ }),
    ).toBeInTheDocument()
    expect(within(tablet).getByRole('grid')).toBeInTheDocument()
  })
})
