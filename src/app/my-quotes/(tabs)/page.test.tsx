import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PendingQuotesPage from '@/app/my-quotes/(tabs)/page'
import { getActiveMoveRequest } from '@/features/move-request/api'
import { MOCK_MOVE_REQUEST } from '@/features/move-request/fixtures/moveRequests'
import {
  confirmQuote,
  getRequestQuotes,
  type CustomerQuote,
} from '@/features/my-quotes/api'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/features/move-request/api', () => ({
  getActiveMoveRequest: vi.fn(),
}))

vi.mock('@/features/my-quotes/api', () => ({
  getRequestQuotes: vi.fn(),
  confirmQuote: vi.fn(),
}))

const mockGetActiveMoveRequest = vi.mocked(getActiveMoveRequest)
const mockGetRequestQuotes = vi.mocked(getRequestQuotes)
const mockConfirmQuote = vi.mocked(confirmQuote)

function createQuote(
  id: string,
  nickname: string,
  overrides: Partial<CustomerQuote> = {},
): CustomerQuote {
  return {
    id,
    price: 180000,
    status: 'SUBMITTED',
    isDesignated: false,
    createdAt: '2026-11-05T09:00:00.000Z',
    mover: {
      id: `mover-${id}`,
      nickname,
      imageUrl: null,
      intro: '고객님의 물품을 안전하게 운송해 드립니다.',
      description: '고객님의 물품을 안전하게 운송해 드립니다.',
      careerYears: 7,
      serviceTypes: ['SMALL'],
      averageRating: 5,
      reviewCount: 178,
      confirmedCount: 334,
      isFavorite: true,
      favoriteCount: 136,
    },
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <PendingQuotesPage />
    </QueryClientProvider>,
  )
}

async function findCard(nickname: string) {
  const name = await screen.findByText(`${nickname} 기사님`)
  return name.closest('article')!
}

describe('PendingQuotesPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('진행 중인 요청 정보와 받은 견적을 카드로 보여 준다', async () => {
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    mockGetRequestQuotes.mockResolvedValue({
      items: [
        createQuote('quote-1', '김코드', { isDesignated: true }),
        createQuote('quote-2', '이코드'),
      ],
    })

    renderPage()

    expect(
      await screen.findByRole('heading', { name: '소형이사' }),
    ).toBeInTheDocument()
    // 2026-11-04T12:00Z는 한국 시간으로 11월 4일 밤 9시다.
    expect(screen.getByText('견적 신청일: 2026년 11월 4일')).toBeInTheDocument()
    expect(screen.getByText('서울특별시 중구')).toBeInTheDocument()
    expect(screen.getByText('부산광역시 해운대구')).toBeInTheDocument()
    expect(screen.getByText('2026년 11월 20일 (금)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeInTheDocument()
    expect(mockGetRequestQuotes).toHaveBeenCalledWith('request-1')

    const designated = await findCard('김코드')
    expect(within(designated).getByText('소형이사')).toBeInTheDocument()
    expect(within(designated).getByText('지정 견적 요청')).toBeInTheDocument()
    expect(within(designated).getByText('견적대기')).toBeInTheDocument()
    expect(
      within(designated).getByText('고객님의 물품을 안전하게 운송해 드립니다.'),
    ).toBeInTheDocument()
    expect(within(designated).getByText('180,000원')).toBeInTheDocument()
    expect(
      within(designated).getByRole('link', {
        name: '김코드 기사님 견적 상세보기',
      }),
    ).toHaveAttribute('href', '/my-quotes/quote-1')

    const general = await findCard('이코드')
    expect(within(general).queryByText('지정 견적 요청')).toBeNull()
  })

  it('견적 확정하기를 누르면 그 견적을 확정한다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    mockGetRequestQuotes.mockResolvedValue({
      items: [createQuote('quote-1', '김코드')],
    })
    mockConfirmQuote.mockResolvedValue(
      {} as Awaited<ReturnType<typeof confirmQuote>>,
    )

    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: '김코드 기사님 견적 확정하기',
      }),
    )

    expect(mockConfirmQuote).toHaveBeenCalledWith('quote-1')
  })

  it('받은 견적이 없으면 견적을 기다리는 안내를 보여 준다', async () => {
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    mockGetRequestQuotes.mockResolvedValue({ items: [] })

    renderPage()

    expect(
      await screen.findByText(/기사님들이 열심히 확인 중이에요/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '소형이사' }),
    ).toBeInTheDocument()
  })

  it('견적을 확정한 요청이면 견적을 불러오지 않고 빈 목록을 보여 준다', async () => {
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: { ...MOCK_MOVE_REQUEST, status: 'CONFIRMED' },
    })

    renderPage()

    expect(
      await screen.findByText(/기사님들이 열심히 확인 중이에요/),
    ).toBeInTheDocument()
    expect(mockGetRequestQuotes).not.toHaveBeenCalled()
  })

  it('진행 중인 요청이 없으면 견적 요청 안내를 보여 준다', async () => {
    mockGetActiveMoveRequest.mockResolvedValue({ moveRequest: null })

    renderPage()

    expect(
      await screen.findByText('진행 중인 견적 요청이 없어요'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '견적 요청하기' })).toHaveAttribute(
      'href',
      '/request',
    )
    expect(mockGetRequestQuotes).not.toHaveBeenCalled()
  })

  it('받은 견적을 불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    mockGetRequestQuotes
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce({ items: [createQuote('quote-1', '김코드')] })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '받은 견적을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await findCard('김코드')).toBeInTheDocument()
  })

  it('진행 중인 요청을 불러오지 못하면 알리고, 다시 시도를 누르면 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest
      .mockRejectedValueOnce(new Error('서버 오류'))
      .mockResolvedValueOnce({ moveRequest: null })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '진행 중인 견적 요청을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByText('진행 중인 견적 요청이 없어요'),
    ).toBeInTheDocument()
  })
})
