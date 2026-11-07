import MoveRequestPage from '@/app/request/page'
import { MOCK_MOVE_REQUEST } from '@/features/move-request/fixtures/moveRequests'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/move-request/hooks/useActiveMoveRequest', () => ({
  useActiveMoveRequest: vi.fn(),
}))

vi.mock('@/components/move-request/ActiveMoveRequest', () => ({
  default: () => <div>활성 견적 요청 화면</div>,
}))

vi.mock('@/components/move-request/MoveRequestForm', () => ({
  default: () => <div>견적 요청 생성 폼</div>,
}))

function createActiveMoveRequestResult(
  overrides: Partial<ReturnType<typeof useActiveMoveRequest>> = {},
) {
  return {
    activeMoveRequest: null,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('MoveRequestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useActiveMoveRequest).mockReturnValue(
      createActiveMoveRequestResult(),
    )
  })

  it('처음 진행 중인 견적을 불러오는 동안 로딩 상태를 보여준다', () => {
    vi.mocked(useActiveMoveRequest).mockReturnValue(
      createActiveMoveRequestResult({
        activeMoveRequest: undefined,
        isPending: true,
      }),
    )

    render(<MoveRequestPage />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '진행 중인 견적 요청을 불러오고 있습니다.',
    )
  })

  it('진행 중인 견적 조회에 실패하면 다시 시도한다', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()

    vi.mocked(useActiveMoveRequest).mockReturnValue(
      createActiveMoveRequestResult({
        activeMoveRequest: undefined,
        isError: true,
        refetch,
      }),
    )

    render(<MoveRequestPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '진행 중인 견적 요청을 불러오지 못했습니다.',
    )

    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('진행 중인 견적이 있으면 안내 화면이 표시된다', () => {
    vi.mocked(useActiveMoveRequest).mockReturnValue(
      createActiveMoveRequestResult({
        activeMoveRequest: MOCK_MOVE_REQUEST,
      }),
    )

    render(<MoveRequestPage />)

    expect(screen.getByText('활성 견적 요청 화면')).toBeInTheDocument()
    expect(screen.queryByText('견적 요청 생성 폼')).not.toBeInTheDocument()
  })

  it('진행 중인 견적이 없으면 견적 생성 폼 화면이 표시된다', () => {
    render(<MoveRequestPage />)

    expect(screen.getByText('견적 요청 생성 폼')).toBeInTheDocument()
    expect(screen.queryByText('활성 견적 요청 화면')).not.toBeInTheDocument()
  })

  it('진행 중인 견적을 다시 불러오다 실패해도 작성하던 견적 요청 폼을 유지한다', () => {
    vi.mocked(useActiveMoveRequest).mockReturnValue(
      createActiveMoveRequestResult({ activeMoveRequest: null, isError: true }),
    )

    render(<MoveRequestPage />)

    expect(screen.getByText('견적 요청 생성 폼')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
