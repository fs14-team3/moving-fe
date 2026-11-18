// TODO(#186): 예상 비용 조회 API(BE #94)가 명세에 추가되면 생성된 타입으로 바꾼다.
// BE 계산 로직(estimateMoveCost)의 반환값과 같은 형태다.
export type Surcharge = 'WEEKEND' | 'HOLIDAY'

export type MoveEstimate = {
  minPrice: number
  maxPrice: number
  surcharges: Surcharge[]
}
