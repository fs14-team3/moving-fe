import api from '@/lib/api'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type MoveProgress = Schemas['MoveProgress']

export type MoveProgressStep = Schemas['MoveProgressStep']

export async function getMoveProgress(quoteId: string) {
  const { data } = await api.get<MoveProgress>(`/quotes/${quoteId}/progress`)
  return data
}
