import {
  AREA_RANGE_OPTIONS,
  BOX_RANGE_OPTIONS,
  BUILDING_TYPE_OPTIONS,
  ELEVATOR_OPTIONS,
  FLOOR_OPTIONS,
  MOVE_ITEM_OPTIONS,
  PARKING_OPTIONS,
  RESIDENT_COUNT_OPTIONS,
  SERVICE_LEVEL_OPTIONS,
} from '@/constants/moveDetails'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { formatMoveDate } from '@/features/received-requests/format'
import { getOptionLabel } from '@/lib/options'
import type { Building, MoveRequestDetails } from './types'

type MoveBasicInfo = {
  moveType: ServiceType
  moveDate: string
  from: { address: string }
  to: { address: string }
}

export function getMoveBasicRows({
  moveType,
  moveDate,
  from,
  to,
}: MoveBasicInfo) {
  return [
    { label: '서비스', value: getOptionLabel(SERVICE_TYPE_OPTIONS, moveType) },
    { label: '이용일', value: formatMoveDate(moveDate) },
    { label: '출발지', value: from.address },
    { label: '도착지', value: to.address },
  ]
}

function formatBuilding({
  buildingType,
  floor,
  hasElevator,
  canPark,
}: Building) {
  return [
    getOptionLabel(BUILDING_TYPE_OPTIONS, buildingType),
    getOptionLabel(FLOOR_OPTIONS, floor),
    `엘리베이터 ${getOptionLabel(ELEVATOR_OPTIONS, hasElevator)}`,
    `주차 ${getOptionLabel(PARKING_OPTIONS, canPark)}`,
  ].join(' · ')
}

function formatItems(items: MoveRequestDetails['items']) {
  const quantities = new Map(
    items.map(({ item, quantity }) => [item, quantity]),
  )
  const labels = MOVE_ITEM_OPTIONS.filter(({ value }) =>
    quantities.has(value),
  ).map(({ value, label }) => `${label} ${quantities.get(value)}개`)
  return labels.length > 0 ? labels.join(', ') : '입력하지 않음'
}

export function getMoveDetailRows(details: MoveRequestDetails) {
  const household = [getOptionLabel(AREA_RANGE_OPTIONS, details.areaRange)]
  if (details.residentCount) {
    household.push(
      getOptionLabel(RESIDENT_COUNT_OPTIONS, details.residentCount),
    )
  }

  const rows = [
    {
      label: '이사 방식',
      value: getOptionLabel(SERVICE_LEVEL_OPTIONS, details.serviceLevel),
    },
    { label: '출발지 환경', value: formatBuilding(details.from) },
    { label: '도착지 환경', value: formatBuilding(details.to) },
    { label: '집 규모', value: household.join(' · ') },
    { label: '짐 목록', value: formatItems(details.items) },
    {
      label: '잔짐 박스',
      value: getOptionLabel(BOX_RANGE_OPTIONS, details.boxRange),
    },
  ]
  if (details.memo) rows.push({ label: '요청사항', value: details.memo })
  return rows
}
