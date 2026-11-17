import { LoaderCircle } from 'lucide-react'
import { useId } from 'react'
import {
  formatEstimateRange,
  formatSurcharges,
} from '@/features/move-estimate/format'
import type { MoveEstimate } from '@/features/move-estimate/types'

type MoveEstimateCardProps = {
  estimate?: MoveEstimate
  isLoading?: boolean
}

const CARD = 'rounded-2xl bg-gray-100 px-5 py-4 md:px-6 md:py-5'

// 견적 요청 전에 보여주는 대략적인 예상 비용.
// 계산하지 못하면(주소를 찾지 못하는 등) 카드를 숨긴다.
export default function MoveEstimateCard({
  estimate,
  isLoading = false,
}: MoveEstimateCardProps) {
  const titleId = useId()

  if (isLoading) {
    return (
      <div role="status" className={`${CARD} flex items-center gap-2`}>
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-primary-400"
        />
        <span className="text-sm text-gray-500 md:text-base">
          예상 비용을 계산하고 있어요
        </span>
      </div>
    )
  }

  if (!estimate) return null

  const surcharges = formatSurcharges(estimate)

  return (
    <section aria-labelledby={titleId} className={CARD}>
      <h3
        id={titleId}
        className="text-sm font-medium text-gray-500 md:text-base"
      >
        예상 비용
      </h3>
      <p className="mt-1 text-xl font-bold text-primary-400 md:text-2xl">
        {formatEstimateRange(estimate)}
      </p>
      {surcharges && (
        <p className="mt-2 text-xs text-black-200 md:text-sm">{surcharges}</p>
      )}
      <p className="mt-1 text-xs text-gray-400 md:text-sm">
        실제 견적과 다를 수 있어요
      </p>
    </section>
  )
}
