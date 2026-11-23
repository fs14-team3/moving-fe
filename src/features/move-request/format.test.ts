import { describe, expect, it } from 'vitest'
import { MOCK_MOVE_REQUEST_DETAILS } from '@/features/move-request/fixtures/moveRequests'
import { getMoveDetailRows } from '@/features/move-request/format'

describe('getMoveDetailRows', () => {
  it('상세 정보를 화면에 보여 줄 문구로 바꾸고, 짐은 목록 순서대로 보여 준다', () => {
    expect(getMoveDetailRows(MOCK_MOVE_REQUEST_DETAILS)).toEqual([
      { label: '이사 방식', value: '반포장이사' },
      {
        label: '출발지 환경',
        value: '빌라·연립 · 3층 · 엘리베이터 없음 · 주차 가능',
      },
      {
        label: '도착지 환경',
        value: '아파트 · 5층 이상 · 엘리베이터 있음 · 주차 불가능',
      },
      { label: '집 규모', value: '20평대 · 2인' },
      { label: '짐 목록', value: '침대(퀸) 2개, 에어컨(스탠드) 1개' },
      { label: '잔짐 박스', value: '21~30개' },
      { label: '요청사항', value: '피아노가 있어요' },
    ])
  })

  it('짐이 없으면 입력하지 않았다고 보여 주고, 요청사항과 거주 인원이 없으면 뺀다', () => {
    const rows = getMoveDetailRows({
      ...MOCK_MOVE_REQUEST_DETAILS,
      residentCount: null,
      items: [],
      memo: null,
    })

    expect(rows).toContainEqual({ label: '집 규모', value: '20평대' })
    expect(rows).toContainEqual({ label: '짐 목록', value: '입력하지 않음' })
    expect(rows.map(({ label }) => label)).not.toContain('요청사항')
  })
})
