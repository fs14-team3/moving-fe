import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import DamageReportSection from '@/components/damage-reports/DamageReportSection'
import type { DamageReport } from '@/features/damage-reports/api'
import { useDamageReports } from '@/features/damage-reports/hooks/useDamageReports'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('@/features/damage-reports/hooks/useDamageReports', () => ({
  useDamageReports: vi.fn(),
}))

function photos(name: string, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    url: `https://img/${name}-${index}`,
    thumbnailUrl: `https://img/${name}-${index}-thumbnail`,
  }))
}

const REPORTS: DamageReport[] = [
  {
    id: 'report-2',
    itemName: '냉장고',
    description: '문짝이 찌그러졌어요.',
    createdAt: '2026-11-24T03:00:00.000Z',
    photos: photos('fridge', 1),
  },
  {
    id: 'report-1',
    itemName: '4인용 식탁',
    description: '상판 모서리가 깨졌어요.\n다리도 흔들려요.',
    createdAt: '2026-11-23T03:00:00.000Z',
    photos: photos('table', 3),
  },
]

function mockReports(
  reports = REPORTS,
  state: Partial<ReturnType<typeof useDamageReports>> = {},
) {
  vi.mocked(useDamageReports).mockReturnValue({
    reports,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    refetch: vi.fn(),
    isRefetching: false,
    ...state,
  } as unknown as ReturnType<typeof useDamageReports>)
}

function renderSection() {
  return render(<DamageReportSection quoteId="quote-1" emptyMessage="없음" />)
}

describe('DamageReportSection', () => {
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
    mockReports()
  })

  it('접수한 파손의 품목명, 상세 내용, 사진, 접수일을 보여준다', () => {
    renderSection()

    expect(useDamageReports).toHaveBeenCalledWith('quote-1')
    const section = screen.getByRole('region', { name: '파손 접수' })
    expect(within(section).getByText('2건')).toBeInTheDocument()
    const [fridge, table] = within(section)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.closest('li') as HTMLElement)
    expect(within(fridge).getByText('냉장고')).toBeInTheDocument()
    expect(within(fridge).getByText('문짝이 찌그러졌어요.')).toBeInTheDocument()
    expect(within(fridge).getByText('접수일 2026년 11월 24일')).toBeVisible()
    expect(within(fridge).getAllByRole('button')).toHaveLength(1)
    expect(within(table).getByText('4인용 식탁')).toBeInTheDocument()
    expect(within(table).getByText(/다리도 흔들려요/)).toBeInTheDocument()
    expect(within(table).getAllByRole('button')).toHaveLength(3)
  })

  it('접수한 파손이 없으면 안내 문구를 보여준다', () => {
    mockReports([])

    renderSection()

    expect(screen.getByText('없음')).toBeInTheDocument()
    expect(screen.queryByText(/건$/)).not.toBeInTheDocument()
  })

  it('사진을 선택하면 그 접수의 사진을 크게 보여주고 넘겨 볼 수 있다', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(
      screen.getByRole('button', { name: '4인용 식탁 파손 사진 2 크게 보기' }),
    )

    const viewer = screen.getByRole('dialog', { name: '파손 사진' })
    expect(
      within(viewer).getByRole('img', { name: '파손 사진 2' }),
    ).toBeInTheDocument()
    expect(within(viewer).getByText('2 / 3')).toBeInTheDocument()

    await user.click(within(viewer).getByRole('button', { name: '다음 사진' }))

    expect(within(viewer).getByText('3 / 3')).toBeInTheDocument()
    expect(
      within(viewer).getByRole('button', { name: '다음 사진' }),
    ).toBeDisabled()

    await user.click(within(viewer).getByRole('button', { name: '닫기' }))

    expect(
      screen.queryByRole('dialog', { name: '파손 사진' }),
    ).not.toBeInTheDocument()
  })

  it('불러오는 동안 로딩 상태를 보여준다', () => {
    mockReports([], { isPending: true })

    renderSection()

    expect(screen.getByRole('status')).toHaveTextContent(
      '파손 접수 내역을 불러오고 있습니다.',
    )
    expect(screen.queryByText('없음')).not.toBeInTheDocument()
  })

  it('불러오지 못하면 다시 시도할 수 있다', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockReports([], { isLoadingError: true, refetch })

    renderSection()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      '파손 접수 내역을 불러오지 못했습니다.',
    )
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('새로 불러오지 못하면 보던 내역을 그대로 두고 다시 불러올 수 있다', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockReports(REPORTS, { isRefetchError: true, refetch })

    renderSection()
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      '파손 접수 내역을 새로 불러오지 못했어요.',
    )
    expect(screen.getByText('냉장고')).toBeInTheDocument()
    expect(refetch).toHaveBeenCalledOnce()
  })
})
