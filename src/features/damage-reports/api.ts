import api from '@/lib/api'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type DamageReport = Schemas['DamageReport']

export async function getDamageReports(quoteId: string) {
  const { data } = await api.get<Schemas['DamageReportList']>(
    `/quotes/${quoteId}/damage-reports`,
  )
  return data
}
