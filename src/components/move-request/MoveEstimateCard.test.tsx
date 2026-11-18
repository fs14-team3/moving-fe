import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MoveEstimateCard from '@/components/move-request/MoveEstimateCard'
import type { MoveEstimate } from '@/features/move-estimate/types'

const ESTIMATE: MoveEstimate = {
  minPrice: 710_000,
  maxPrice: 950_000,
  surcharges: [],
}

describe('MoveEstimateCard', () => {
  it('예상 비용 범위를 만 원 단위로 보여 주고 실제 견적과 다를 수 있다고 안내한다', () => {
    render(<MoveEstimateCard estimate={ESTIMATE} />)

    const card = screen.getByRole('region', { name: '예상 비용' })
    expect(card).toHaveTextContent('약 71만 ~ 95만 원')
    expect(card).toHaveTextContent('실제 견적과 다를 수 있어요')
    expect(card).not.toHaveTextContent('추가 비용 포함')
  })

  it('추가 비용이 붙으면 사유를 함께 보여 준다', () => {
    render(
      <MoveEstimateCard
        estimate={{ ...ESTIMATE, surcharges: ['WEEKEND', 'HOLIDAY'] }}
      />,
    )

    expect(screen.getByText('주말 · 공휴일 추가 비용 포함')).toBeInTheDocument()
  })

  it('천만 원 단위 금액도 쉼표를 넣어 보여 준다', () => {
    render(
      <MoveEstimateCard
        estimate={{ ...ESTIMATE, minPrice: 10_350_000, maxPrice: 14_000_000 }}
      />,
    )

    expect(screen.getByText('약 1,035만 ~ 1,400만 원')).toBeInTheDocument()
  })

  it('계산하는 동안에는 불러오는 중을 알린다', () => {
    render(<MoveEstimateCard isLoading />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '예상 비용을 계산하고 있어요',
    )
  })

  it('예상 비용이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<MoveEstimateCard />)

    expect(container).toBeEmptyDOMElement()
  })
})
