import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import PendingQuotesPage from '@/app/my-quotes/(tabs)/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  deleteMoveRequest,
  getActiveMoveRequest,
} from '@/features/move-request/api'
import { MOCK_MOVE_REQUEST } from '@/features/move-request/fixtures/moveRequests'
import {
  confirmQuote,
  getRequestQuotes,
  type CustomerQuote,
} from '@/features/my-quotes/api'
import { ApiError } from '@/lib/api-error'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/features/move-request/api', () => ({
  getActiveMoveRequest: vi.fn(),
  deleteMoveRequest: vi.fn(),
}))

vi.mock('@/features/my-quotes/api', () => ({
  getRequestQuotes: vi.fn(),
  confirmQuote: vi.fn(),
}))

const mockGetActiveMoveRequest = vi.mocked(getActiveMoveRequest)
const mockDeleteMoveRequest = vi.mocked(deleteMoveRequest)
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
    comment: null,
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
    comment: overrides.comment ?? null,
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

async function openDeleteModal(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: '삭제하기' }))
  return screen.getByRole('dialog', { name: '견적 요청 삭제' })
}

function mockTwoPendingQuotes() {
  mockGetActiveMoveRequest.mockResolvedValue({
    moveRequest: MOCK_MOVE_REQUEST,
  })
  mockGetRequestQuotes.mockResolvedValue({
    items: [createQuote('quote-1', '김코드'), createQuote('quote-2', '이코드')],
  })
}

async function openConfirmModal(user: UserEvent, nickname: string) {
  await user.click(
    await screen.findByRole('button', {
      name: `${nickname} 기사님 견적 확정하기`,
    }),
  )
  return screen.getByRole('dialog', { name: '견적 확정' })
}

describe('PendingQuotesPage', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('진행 중인 요청 정보와 받은 견적을 카드로 보여 준다', async () => {
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: { ...MOCK_MOVE_REQUEST, quoteCount: 2 },
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
    // 견적이 도착한 요청은 삭제할 수 없다.
    expect(screen.queryByRole('button', { name: '삭제하기' })).toBeNull()
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

  it('견적 확정하기를 누르면 확인 모달을 열고, 확정하기를 눌러야 그 견적을 확정한다', async () => {
    const user = userEvent.setup()
    mockTwoPendingQuotes()
    mockConfirmQuote.mockResolvedValue(
      {} as Awaited<ReturnType<typeof confirmQuote>>,
    )

    renderPage()
    const dialog = await openConfirmModal(user, '이코드')

    expect(mockConfirmQuote).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: '확정하기' }))

    expect(mockConfirmQuote).toHaveBeenCalledExactlyOnceWith('quote-2')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it.each([
    ['취소', (dialog: HTMLElement) => within(dialog).getByText('취소')],
    ['닫기', (dialog: HTMLElement) => within(dialog).getByLabelText('닫기')],
    ['배경', (dialog: HTMLElement) => dialog],
  ])('확인 모달에서 %s 선택 시 확정하지 않고 닫는다', async (_, getTarget) => {
    const user = userEvent.setup()
    mockTwoPendingQuotes()

    renderPage()
    const dialog = await openConfirmModal(user, '김코드')
    await user.click(getTarget(dialog))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockConfirmQuote).not.toHaveBeenCalled()
  })

  it('확정 처리 중에는 다시 확정하거나 모달을 닫을 수 없다', async () => {
    const user = userEvent.setup()
    mockTwoPendingQuotes()
    mockConfirmQuote.mockReturnValue(new Promise(() => {}))

    renderPage()
    const dialog = await openConfirmModal(user, '김코드')
    const confirmButton = within(dialog).getByRole('button', {
      name: '확정하기',
    })
    await user.click(confirmButton)

    await waitFor(() => expect(confirmButton).toBeDisabled())
    expect(confirmButton).toHaveAttribute('aria-busy', 'true')
    expect(within(dialog).getByRole('button', { name: '취소' })).toBeDisabled()

    await user.click(confirmButton)
    await user.click(within(dialog).getByRole('button', { name: '닫기' }))
    await user.click(dialog)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))

    expect(screen.getByRole('dialog', { name: '견적 확정' })).toBeVisible()
    expect(mockConfirmQuote).toHaveBeenCalledOnce()
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
    expect(screen.queryByRole('button', { name: '삭제하기' })).toBeNull()
  })

  it('견적이 없는 요청은 확인 모달을 거쳐 삭제하고, 견적 요청 안내를 보여 준다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest
      .mockResolvedValueOnce({ moveRequest: MOCK_MOVE_REQUEST })
      .mockResolvedValue({ moveRequest: null })
    mockGetRequestQuotes.mockResolvedValue({ items: [] })
    mockDeleteMoveRequest.mockResolvedValue()

    renderPage()

    const dialog = await openDeleteModal(user)
    expect(dialog).toHaveTextContent('삭제한 요청은 되돌릴 수 없어요.')
    expect(mockDeleteMoveRequest).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    expect(mockDeleteMoveRequest).toHaveBeenCalledWith('request-1')
    expect(
      await screen.findByText('진행 중인 견적 요청이 없어요'),
    ).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.deleteSuccess,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it.each(['취소', '닫기'])(
    '삭제 모달에서 %s를 누르면 삭제하지 않고 닫는다',
    async (name) => {
      const user = userEvent.setup()
      mockGetActiveMoveRequest.mockResolvedValue({
        moveRequest: MOCK_MOVE_REQUEST,
      })
      mockGetRequestQuotes.mockResolvedValue({ items: [] })

      renderPage()

      const dialog = await openDeleteModal(user)
      await user.click(within(dialog).getByRole('button', { name }))

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(mockDeleteMoveRequest).not.toHaveBeenCalled()
    },
  )

  it('삭제 중에는 다시 삭제하거나 모달을 닫을 수 없다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest.mockResolvedValue({
      moveRequest: MOCK_MOVE_REQUEST,
    })
    mockGetRequestQuotes.mockResolvedValue({ items: [] })
    mockDeleteMoveRequest.mockReturnValue(new Promise(() => {}))

    renderPage()
    const dialog = await openDeleteModal(user)
    const deleteButton = within(dialog).getByRole('button', {
      name: '삭제하기',
    })
    await user.click(deleteButton)

    await waitFor(() => expect(deleteButton).toBeDisabled())
    expect(deleteButton).toHaveAttribute('aria-busy', 'true')
    expect(within(dialog).getByRole('button', { name: '취소' })).toBeDisabled()

    await user.click(deleteButton)
    await user.click(within(dialog).getByRole('button', { name: '닫기' }))
    await user.click(dialog)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))

    expect(screen.getByRole('dialog', { name: '견적 요청 삭제' })).toBeVisible()
    expect(mockDeleteMoveRequest).toHaveBeenCalledOnce()
  })

  it('그사이 견적이 도착해 삭제하지 못하면 알리고 요청 정보를 다시 불러온다', async () => {
    const user = userEvent.setup()
    mockGetActiveMoveRequest
      .mockResolvedValueOnce({ moveRequest: MOCK_MOVE_REQUEST })
      .mockResolvedValue({
        moveRequest: { ...MOCK_MOVE_REQUEST, quoteCount: 1 },
      })
    mockGetRequestQuotes
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValue({ items: [createQuote('quote-1', '김코드')] })
    mockDeleteMoveRequest.mockRejectedValue(
      new ApiError('REQUEST_HAS_QUOTES', '견적이 있는 요청입니다.', 409),
    )

    renderPage()

    const dialog = await openDeleteModal(user)
    await user.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    expect(toast.error).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.requestHasQuotes,
    )
    expect(await findCard('김코드')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '삭제하기' })).toBeNull(),
    )
    expect(screen.queryByRole('dialog')).toBeNull()
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
