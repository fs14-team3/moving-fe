import { render, screen, within } from '@testing-library/react'
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
import MoveProgressSection from '@/components/move-progress/MoveProgressSection'
import type { MoveProgress } from '@/features/move-progress/api'
import { useMoveProgress } from '@/features/move-progress/hooks/useMoveProgress'
import { useRecordMoveProgress } from '@/features/move-progress/hooks/useRecordMoveProgress'

vi.mock('@/features/move-progress/hooks/useMoveProgress', () => ({
  useMoveProgress: vi.fn(),
}))

vi.mock('@/features/move-progress/hooks/useRecordMoveProgress', () => ({
  useRecordMoveProgress: vi.fn(),
}))

const TODAY = '2026-11-23'

const PROGRESS: MoveProgress = {
  steps: [
    { step: 'DEPARTED', recordedAt: '2026-11-23T00:10:00.000Z' },
    { step: 'LOADING', recordedAt: '2026-11-23T01:35:00.000Z' },
  ],
  nextStep: 'IN_TRANSIT',
  canRecord: false,
}

function mockProgress(state: Partial<ReturnType<typeof useMoveProgress>> = {}) {
  vi.mocked(useMoveProgress).mockReturnValue({
    progress: PROGRESS,
    isPending: false,
    isLoadingError: false,
    refetch: vi.fn(),
    isRefetching: false,
    ...state,
  } as unknown as ReturnType<typeof useMoveProgress>)
}

const recording = { mutate: vi.fn(), isPending: false }

function mockRecording(isPending = false) {
  vi.mocked(useRecordMoveProgress).mockReturnValue({
    ...recording,
    isPending,
  } as unknown as ReturnType<typeof useRecordMoveProgress>)
}

function stepItems() {
  return within(screen.getByRole('list')).getAllByRole('listitem')
}

describe('MoveProgressSection', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(`${TODAY}T03:00:00.000Z`))
    mockProgress()
    mockRecording()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('출발부터 완료까지 단계와 한국 시간 기준 기록 시각을 보여준다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(
      screen.getByRole('region', { name: '이사 진행 상황' }),
    ).toBeInTheDocument()
    const items = stepItems()
    expect(items.map((item) => item.textContent)).toEqual([
      '출발09:10',
      '상차10:35',
      '운행-기록 전',
      '하차-기록 전',
      '완료-기록 전',
    ])
    expect(within(items[0]).getByText('09:10')).toHaveAttribute(
      'datetime',
      '2026-11-23T00:10:00.000Z',
    )
  })

  it('마지막으로 기록한 단계를 현재 단계로 표시한다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    const current = stepItems().filter((item) =>
      item.hasAttribute('aria-current'),
    )
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAttribute('aria-current', 'step')
    expect(current[0]).toHaveTextContent('상차')
  })

  it('이사 당일에는 진행 상황을 계속 다시 불러온다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(useMoveProgress).toHaveBeenCalledWith('quote-1', true)
  })

  it('이사일이 지나면 기록한 진행 상황만 보여주고 다시 불러오지 않는다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate="2026-11-22" />)

    expect(useMoveProgress).toHaveBeenCalledWith('quote-1', false)
    expect(stepItems()).toHaveLength(5)
  })

  it('이사일 전에는 진행 상황 영역을 숨긴다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate="2026-11-24" />)

    expect(
      screen.queryByRole('region', { name: '이사 진행 상황' }),
    ).not.toBeInTheDocument()
    expect(useMoveProgress).not.toHaveBeenCalled()
  })

  it('불러오는 동안 로딩 상태를 보여준다', () => {
    mockProgress({ progress: undefined, isPending: true })

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '이사 진행 상황을 불러오고 있습니다.',
    )
  })

  it('불러오지 못하면 다시 시도할 수 있다', async () => {
    const refetch = vi.fn()
    mockProgress({ progress: undefined, isLoadingError: true, refetch })
    const user = userEvent.setup()

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이사 진행 상황을 불러오지 못했습니다.',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('기록할 수 없으면 다음 단계 버튼을 보여 주지 않는다', () => {
    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(
      screen.queryByRole('button', { name: /기록하기$/ }),
    ).not.toBeInTheDocument()
  })

  it('기록할 수 있으면 다음 단계 버튼 하나만 보여준다', () => {
    mockProgress({ progress: { ...PROGRESS, canRecord: true } })

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(screen.getAllByRole('button', { name: /기록하기$/ })).toEqual([
      screen.getByRole('button', { name: '운행 기록하기' }),
    ])
  })

  it('다음 단계 버튼을 누르고 확인하면 그 단계를 기록한다', async () => {
    mockProgress({ progress: { ...PROGRESS, canRecord: true } })
    const user = userEvent.setup()

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)
    await user.click(screen.getByRole('button', { name: '운행 기록하기' }))

    const dialog = screen.getByRole('dialog', { name: '진행 단계 기록' })
    expect(dialog).toHaveTextContent('운행 단계를 기록할까요?')
    expect(recording.mutate).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: '기록하기' }))
    expect(useRecordMoveProgress).toHaveBeenCalledWith('quote-1')
    expect(recording.mutate).toHaveBeenCalledWith('IN_TRANSIT', {
      onSettled: expect.any(Function),
    })
  })

  it('확인 창에서 취소하면 기록하지 않는다', async () => {
    mockProgress({ progress: { ...PROGRESS, canRecord: true } })
    const user = userEvent.setup()

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)
    await user.click(screen.getByRole('button', { name: '운행 기록하기' }))
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(recording.mutate).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('dialog', { name: '진행 단계 기록' }),
    ).not.toBeInTheDocument()
  })

  it('기록 요청 중에는 다음 단계 버튼을 누를 수 없다', () => {
    mockProgress({ progress: { ...PROGRESS, canRecord: true } })
    mockRecording(true)

    render(<MoveProgressSection quoteId="quote-1" moveDate={TODAY} />)

    expect(screen.getByRole('button', { name: '운행 기록하기' })).toBeDisabled()
  })
})
