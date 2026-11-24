import {
  MOVE_ITEM_OPTIONS,
  type AreaRange,
  type BoxRange,
  type BuildingType,
  type Floor,
  type MoveItem,
  type ResidentCount,
  type ServiceLevel,
} from '@/constants/moveDetails'
import type { ServiceType } from '@/constants/services'
import type { Building, MoveRequestDetails } from './types'

export type BuildingDraft = {
  buildingType: BuildingType | null
  floor: Floor | null
  hasElevator: boolean | null
  canPark: boolean | null
}

export type MoveDetailsDraft = {
  serviceLevel: ServiceLevel | null
  areaRange: AreaRange | null
  residentCount: ResidentCount | null
  from: BuildingDraft
  to: BuildingDraft
  items: Partial<Record<MoveItem, number>>
  boxRange: BoxRange | null
  memo: string
}

const EMPTY_BUILDING: BuildingDraft = {
  buildingType: null,
  floor: null,
  hasElevator: null,
  canPark: null,
}

export const EMPTY_DETAILS_DRAFT: MoveDetailsDraft = {
  serviceLevel: null,
  areaRange: null,
  residentCount: null,
  from: EMPTY_BUILDING,
  to: EMPTY_BUILDING,
  items: {},
  boxRange: null,
  memo: '',
}

function toBuilding({
  buildingType,
  floor,
  hasElevator,
  canPark,
}: BuildingDraft): Building | null {
  if (
    buildingType === null ||
    floor === null ||
    hasElevator === null ||
    canPark === null
  ) {
    return null
  }
  return { buildingType, floor, hasElevator, canPark }
}

export function isHouseholdComplete(
  draft: MoveDetailsDraft,
  moveType: ServiceType | null,
) {
  return Boolean(
    draft.serviceLevel &&
    draft.areaRange &&
    (moveType === 'OFFICE' || draft.residentCount),
  )
}

export function isBuildingsComplete(draft: MoveDetailsDraft) {
  return toBuilding(draft.from) !== null && toBuilding(draft.to) !== null
}

export function toMoveRequestDetails(
  draft: MoveDetailsDraft,
  moveType: ServiceType | null,
): MoveRequestDetails | null {
  const from = toBuilding(draft.from)
  const to = toBuilding(draft.to)
  const { serviceLevel, areaRange, boxRange } = draft
  if (
    !serviceLevel ||
    !areaRange ||
    !boxRange ||
    !from ||
    !to ||
    !isHouseholdComplete(draft, moveType)
  ) {
    return null
  }

  return {
    serviceLevel,
    from,
    to,
    areaRange,
    residentCount: moveType === 'OFFICE' ? null : draft.residentCount,
    items: MOVE_ITEM_OPTIONS.flatMap(({ value: item }) => {
      const quantity = draft.items[item] ?? 0
      return quantity > 0 ? [{ item, quantity }] : []
    }),
    boxRange,
    memo: draft.memo.trim() || null,
  }
}
