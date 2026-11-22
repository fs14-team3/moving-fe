import type {
  CreateMoveRequestBody,
  Designation,
  MoveRequestDetails,
  MoveRequestResponse,
} from '../types'

export const MOCK_MOVE_REQUEST_DETAILS: MoveRequestDetails = {
  serviceLevel: 'HALF_PACKING',
  from: { buildingType: 'VILLA', floor: 3, hasElevator: false, canPark: true },
  to: {
    buildingType: 'APARTMENT',
    floor: 5,
    hasElevator: true,
    canPark: false,
  },
  areaRange: 'TWENTIES',
  residentCount: 2,
  items: [
    { item: 'AIRCON_STAND', quantity: 1 },
    { item: 'BED_QUEEN', quantity: 2 },
  ],
  boxRange: 'UP_TO_30',
  memo: '피아노가 있어요',
}

export const MOCK_CREATE_MOVE_REQUEST_BODY: CreateMoveRequestBody = {
  moveType: 'SMALL' as const,
  moveDate: '2026-11-20',
  from: { address: '서울특별시 중구 세종대로 110', zonecode: '04524' },
  to: { address: '부산광역시 해운대구 해운대로 1', zonecode: '48094' },
}

export const MOCK_MOVE_REQUEST: MoveRequestResponse = {
  id: 'request-1',
  moveType: 'SMALL',
  moveDate: '2026-11-20',
  from: {
    address: '서울특별시 중구 세종대로 110',
    zonecode: '04524',
    region: '서울',
  },
  to: {
    address: '부산광역시 해운대구 해운대로 1',
    zonecode: '48094',
    region: '부산',
  },
  details: null,
  status: 'PENDING',
  quoteCount: 0,
  designatedMoverIds: [],
  createdAt: '2026-11-04T12:00:00.000Z',
  confirmedAt: null,
}

export const MOCK_DESIGNATION: Designation = {
  moveRequestId: 'request-1',
  moverId: '1',
  createdAt: '2026-11-04T12:00:00.000Z',
}
