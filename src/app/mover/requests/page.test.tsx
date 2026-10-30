import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import ReceivedRequestsPage from '@/app/mover/requests/page'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  getReceivedRequests,
  sendQuote,
  type ReceivedRequest,
} from '@/features/received-requests/api'
import { ApiError } from '@/lib/api-error'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('sonner', () => ({ toast }))

vi.mock('@/features/received-requests/api', () => ({
  getReceivedRequests: vi.fn(),
  sendQuote: vi.fn(),
}))

const mockGetReceivedRequests = vi.mocked(getReceivedRequests)
const mockSendQuote = vi.mocked(sendQuote)

type SentQuote = Awaited<ReturnType<typeof sendQuote>>

function createRequest(id: string, customerName: string): ReceivedRequest {
  return {
    id,
    customerName,
    moveType: 'HOME',
    moveDate: '2026-11-20',
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    status: 'PENDING',
    isDesignated: false,
    createdAt: '2026-10-30T09:00:00.000Z',
  }
}

// jsdom에는 IntersectionObserver가 없다. 목록 끝 요소가 계속 화면에 보이는 상황을 흉내 낸다.
class VisibleIntersectionObserver {
  private callback: IntersectionObserverCallback
  private disconnected = false

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe() {
    setTimeout(() => {
      if (this.disconnected) return
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    })
  }

  disconnect() {
    this.disconnected = true
  }

  unobserve() {}

  takeRecords() {
    return []
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <ReceivedRequestsPage />
    </QueryClientProvider>,
  )
}

// 받은 요청 한 건을 보여 주고, 견적 보내기 모달을 연다.
async function openSendModal() {
  // 글자마다 기다리지 않게 해서, 테스트를 함께 돌릴 때도 시간 제한에 걸리지 않게 한다.
  const user = userEvent.setup({ delay: null })
  mockGetReceivedRequests.mockResolvedValue({
    items: [createRequest('request-1', '김코드')],
    hasNext: false,
    nextCursor: null,
  })
  renderPage()

  // 테스트를 함께 돌려 느려질 때도 첫 목록을 기다릴 수 있게 기본(1초)보다 넉넉히 기다린다.
  await screen.findByText('김코드 고객님', undefined, { timeout: 3000 })
  await user.click(screen.getByRole('button', { name: '견적 보내기' }))
  const dialog = screen.getByRole('dialog', { name: '견적 보내기' })
  await user.type(
    within(dialog).getByLabelText('견적가를 입력해 주세요'),
    '250000',
  )
  await user.type(
    within(dialog).getByLabelText('코멘트를 입력해 주세요'),
    '꼼꼼하게 옮겨 드릴게요',
  )
  const submit = () =>
    user.click(within(dialog).getByRole('button', { name: '견적 보내기' }))

  return { user, dialog, submit }
}

describe('ReceivedRequestsPage', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockGetReceivedRequests.mockReset()
    mockSendQuote.mockReset()
    vi.clearAllMocks()
  })

  it('견적 보내기를 누른 요청으로 모달을 열고, 보내면 견적가를 보낸 뒤 모달을 닫고 목록을 다시 불러온다', async () => {
    mockSendQuote.mockResolvedValue({} as SentQuote)
    const { dialog, submit } = await openSendModal()
    expect(within(dialog).getByText('김코드 고객님')).toBeInTheDocument()

    await submit()

    expect(mockSendQuote).toHaveBeenCalledWith('request-1', { price: 250000 })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.estimate.sendSuccess,
    )
    await waitFor(() =>
      expect(mockGetReceivedRequests).toHaveBeenCalledTimes(2),
    )
  })

  it('보내는 중에는 다시 누를 수 없고, 실패하면 알리고 입력을 고칠 수 있게 모달을 열어 둔다', async () => {
    let rejectSend: (error: unknown) => void = () => {}
    mockSendQuote.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectSend = reject
        }),
    )
    const { user, dialog, submit } = await openSendModal()

    await submit()

    const submitButton = within(dialog).getByRole('button', {
      name: '견적 보내기',
    })
    await waitFor(() => expect(submitButton).toBeDisabled())
    await user.click(submitButton)
    expect(mockSendQuote).toHaveBeenCalledTimes(1)

    rejectSend(new ApiError('INTERNAL_ERROR', 'Server Error', 500))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        TOAST_MESSAGES.estimate.sendFailed,
      ),
    )
    expect(
      screen.getByRole('dialog', { name: '견적 보내기' }),
    ).toBeInTheDocument()
    expect(submitButton).toBeEnabled()
  })

  it('다음 페이지를 불러오지 못하면 다시 요청하지 않고, 다시 시도를 누르면 이어서 불러온다', async () => {
    const user = userEvent.setup()
    // 실제 요청처럼 조금 뒤에 실패해야 화면이 '불러오는 중'을 거친다.
    mockGetReceivedRequests
      .mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('서버 오류')), 10),
          ),
      )
      .mockResolvedValueOnce({
        items: [createRequest('1', '김코드')],
        hasNext: true,
        nextCursor: 'cursor-2',
      })

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '요청을 더 불러오지 못했습니다.',
    )
    expect(
      screen.getByRole('heading', { name: '김코드 고객님' }),
    ).toBeInTheDocument()
    // 목록 끝 요소가 계속 보여도 실패한 다음 페이지를 저절로 다시 부르지 않는다.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(mockGetReceivedRequests).toHaveBeenCalledTimes(2)

    mockGetReceivedRequests.mockResolvedValueOnce({
      items: [createRequest('2', '이코드')],
      hasNext: false,
      nextCursor: null,
    })
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByRole('heading', { name: '이코드 고객님' }),
    ).toBeInTheDocument()
    expect(mockGetReceivedRequests).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-2' }),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
