import type {
  CreateMoveRequestBody,
  Designation,
  MoveRequestResponse,
} from '../types'

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
