import MyMoverProfile from '@/components/mover/MyMoverProfile'
import { MOCK_MOVER_DETAILS } from '@/features/movers/fixtures/movers'
import { useMyMover } from '@/features/movers/hooks/useMyMover'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/features/movers/hooks/useMyMover', () => ({
  useMyMover: vi.fn(),
}))

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

describe('MyMoverProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMyMover).mockReturnValue(createMyMoverResult())
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
})
