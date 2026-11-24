import { describe, expect, it } from 'vitest'
import {
  EMPTY_DETAILS_DRAFT,
  toMoveRequestDetails,
  type MoveDetailsDraft,
} from '@/features/move-request/details'

const COMPLETE_DRAFT: MoveDetailsDraft = {
  serviceLevel: 'FULL_PACKING',
  areaRange: 'TENS',
  residentCount: 1,
  from: {
    buildingType: 'OFFICETEL',
    floor: 2,
    hasElevator: true,
    canPark: true,
  },
  to: { buildingType: 'HOUSE', floor: -1, hasElevator: false, canPark: false },
  items: { AIRCON_WALL: 1, BED_SINGLE: 2, DESK: 0 },
  boxRange: 'UP_TO_10',
  memo: '  주차는 건물 뒤편에 할 수 있어요  ',
}

describe('toMoveRequestDetails', () => {
  it('입력을 다 채우면 요청 본문으로 바꾸고, 짐은 목록 순서대로 0개를 빼고 보낸다', () => {
    expect(toMoveRequestDetails(COMPLETE_DRAFT, 'SMALL')).toEqual({
      serviceLevel: 'FULL_PACKING',
      from: {
        buildingType: 'OFFICETEL',
        floor: 2,
        hasElevator: true,
        canPark: true,
      },
      to: {
        buildingType: 'HOUSE',
        floor: -1,
        hasElevator: false,
        canPark: false,
      },
      areaRange: 'TENS',
      residentCount: 1,
      items: [
        { item: 'BED_SINGLE', quantity: 2 },
        { item: 'AIRCON_WALL', quantity: 1 },
      ],
      boxRange: 'UP_TO_10',
      memo: '주차는 건물 뒤편에 할 수 있어요',
    })
  })

  it('짐 목록과 요청사항은 비워도 되고, 빈 요청사항은 null로 보낸다', () => {
    expect(
      toMoveRequestDetails(
        { ...COMPLETE_DRAFT, items: {}, memo: '   ' },
        'HOME',
      ),
    ).toMatchObject({ items: [], memo: null })
  })

  it.each<[string, Partial<MoveDetailsDraft>]>([
    ['이사 방식', { serviceLevel: null }],
    ['평수', { areaRange: null }],
    ['거주 인원', { residentCount: null }],
    ['출발지 층수', { from: { ...COMPLETE_DRAFT.from, floor: null } }],
    ['도착지 엘리베이터', { to: { ...COMPLETE_DRAFT.to, hasElevator: null } }],
    ['잔짐 박스', { boxRange: null }],
  ])('%s를 고르지 않으면 null을 반환한다', (_field, patch) => {
    expect(toMoveRequestDetails({ ...COMPLETE_DRAFT, ...patch }, 'HOME')).toBe(
      null,
    )
  })

  it('사무실이사는 거주 인원 없이 만들고, 골라 둔 인원도 보내지 않는다', () => {
    expect(
      toMoveRequestDetails(
        { ...COMPLETE_DRAFT, residentCount: null },
        'OFFICE',
      ),
    ).toMatchObject({ residentCount: null })
    expect(toMoveRequestDetails(COMPLETE_DRAFT, 'OFFICE')).toMatchObject({
      residentCount: null,
    })
  })

  it('아무것도 고르지 않은 초기 상태는 null을 반환한다', () => {
    expect(toMoveRequestDetails(EMPTY_DETAILS_DRAFT, 'HOME')).toBeNull()
  })
})
