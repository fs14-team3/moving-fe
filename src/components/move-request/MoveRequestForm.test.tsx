import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MoveRequestForm from '@/components/move-request/MoveRequestForm'
import { getMoveEstimate } from '@/features/move-estimate/api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/features/move-estimate/api', () => ({
  getMoveEstimate: vi.fn(),
}))

vi.mock('@/features/move-request/hooks/useCreateMoveRequest', () => ({
  useCreateMoveRequest: () => ({ mutate: vi.fn(), isPending: false }),
}))

// 날짜 선택과 주소 검색은 각자 테스트가 있으니 값만 넘기는 버튼으로 바꾼다.
vi.mock('@/components/move-request/MoveTypeStep', () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('HOME')}>
      가정이사 선택
    </button>
  ),
}))

vi.mock('@/components/move-request/MoveDateStep', () => ({
  default: ({ onChange }: { onChange: (value: Date) => void }) => (
    <button type="button" onClick={() => onChange(new Date(2026, 11, 5))}>
      날짜 선택
    </button>
  ),
}))

vi.mock('@/components/move-request/MoveAddressStep', () => ({
  default: ({
    onDepartureChange,
    onArrivalChange,
  }: {
    onDepartureChange: (address: object) => void
    onArrivalChange: (address: object) => void
  }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onDepartureChange({
            address: '서울 중구 세종대로 110',
            zonecode: '04524',
          })
        }
      >
        출발지 선택
      </button>
      <button
        type="button"
        onClick={() =>
          onArrivalChange({
            address: '서울 강남구 테헤란로 152',
            zonecode: '06236',
          })
        }
      >
        도착지 선택
      </button>
    </>
  ),
}))

const ESTIMATE = {
  distanceKm: 12.3,
  minPrice: 710_000,
  maxPrice: 950_000,
  surcharges: [],
}

function renderForm() {
  const queryClient = new QueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <MoveRequestForm />
    </QueryClientProvider>,
  )

  return userEvent.setup()
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '가정이사 선택' }))
  await user.click(screen.getByRole('button', { name: '날짜 선택' }))
  await user.click(screen.getByRole('button', { name: '출발지 선택' }))
  await user.click(screen.getByRole('button', { name: '도착지 선택' }))
}

describe('MoveRequestForm 예상 비용', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('입력이 다 채워지기 전에는 예상 비용을 조회하지 않는다', async () => {
    const user = renderForm()

    await user.click(screen.getByRole('button', { name: '가정이사 선택' }))
    await user.click(screen.getByRole('button', { name: '날짜 선택' }))
    await user.click(screen.getByRole('button', { name: '출발지 선택' }))

    expect(getMoveEstimate).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('region', { name: '예상 비용' }),
    ).not.toBeInTheDocument()
  })

  it('입력을 다 채우면 예상 비용을 조회해 보여 준다', async () => {
    vi.mocked(getMoveEstimate).mockResolvedValue(ESTIMATE)
    const user = renderForm()

    await fillForm(user)

    expect(
      await screen.findByRole('region', { name: '예상 비용' }),
    ).toHaveTextContent('약 71만 ~ 95만 원')
    expect(getMoveEstimate).toHaveBeenCalledWith(
      {
        moveType: 'HOME',
        moveDate: '2026-12-05',
        from: '서울 중구 세종대로 110',
        to: '서울 강남구 테헤란로 152',
      },
      expect.any(AbortSignal),
    )
  })

  it('계산하는 동안 로딩 문구를 보여 준다', async () => {
    vi.mocked(getMoveEstimate).mockReturnValue(new Promise(() => {}))
    const user = renderForm()

    await fillForm(user)

    expect(screen.getByRole('status')).toHaveTextContent(
      '예상 비용을 계산하고 있어요',
    )
  })

  it('예상 비용을 계산하지 못하면 카드를 숨긴다', async () => {
    vi.mocked(getMoveEstimate).mockRejectedValue(
      new Error('주소를 찾을 수 없습니다'),
    )
    const user = renderForm()

    await fillForm(user)

    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('region', { name: '예상 비용' }),
    ).not.toBeInTheDocument()
    // 참고용이라 실패해도 다시 시도하지 않는다.
    expect(getMoveEstimate).toHaveBeenCalledOnce()
  })
})
