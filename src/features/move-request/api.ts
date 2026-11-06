import api from '@/lib/api'
import type { MoverId } from '../movers/types'
import type {
  ActiveMoveRequestResponse,
  CreateMoveRequestBody,
  Designation,
  MoveRequestResponse,
  RequestId,
} from './types'

export async function createMoveRequest(body: CreateMoveRequestBody) {
  const { data } = await api.post<MoveRequestResponse>('/move-requests', body)

  return data
}

export async function getActiveMoveRequest() {
  const { data } = await api.get<ActiveMoveRequestResponse>(
    '/move-requests/active',
  )

  return data
}

export async function createDesignation(
  requestId: RequestId,
  moverId: MoverId,
) {
  const { data } = await api.post<Designation>(
    `/move-requests/${requestId}/designations`,
    {
      moverId,
    },
  )

  return data
}
