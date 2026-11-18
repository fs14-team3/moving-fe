import type { MoveEstimate, Surcharge } from './types'

const SURCHARGE_LABEL: Record<Surcharge, string> = {
  WEEKEND: '주말',
  HOLIDAY: '공휴일',
}

// 710000 → '71만'
function toManwon(price: number) {
  return `${Math.round(price / 10_000).toLocaleString('ko-KR')}만`
}

// '약 71만 ~ 95만 원'
export function formatEstimateRange({ minPrice, maxPrice }: MoveEstimate) {
  return `약 ${toManwon(minPrice)} ~ ${toManwon(maxPrice)} 원`
}

// '주말 · 공휴일 추가 비용 포함'. 추가 비용이 없으면 null
export function formatSurcharges({ surcharges }: MoveEstimate) {
  if (surcharges.length === 0) return null
  return `${surcharges.map((s) => SURCHARGE_LABEL[s]).join(' · ')} 추가 비용 포함`
}
