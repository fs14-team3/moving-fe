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

// 받은 견적이 없는 요청만 삭제할 수 있다. 견적이 있으면 409(REQUEST_HAS_QUOTES)
export async function deleteMoveRequest(requestId: RequestId) {
  await api.delete(`/move-requests/${requestId}`)
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
