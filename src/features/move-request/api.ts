import api from '@/lib/api'
import type { CreateMoveRequestBody, CreateMoveRequestResponse } from './types'

export async function createMoveRequest(body: CreateMoveRequestBody) {
  const { data } = await api.post<CreateMoveRequestResponse>(
    '/move-requests',
    body,
  )

  return data
}
