import api from '@/lib/api'
import type {
  ActiveMoveRequestResponse,
  CreateMoveRequestBody,
  MoveRequestResponse,
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
