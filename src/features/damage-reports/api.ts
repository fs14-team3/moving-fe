import api from '@/lib/api'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type DamageReport = Schemas['DamageReport']

export type DamageReportList = Schemas['DamageReportList']

export type DamageReportCreate = Schemas['DamageReportCreate']

export async function getDamageReports(quoteId: string) {
  const { data } = await api.get<DamageReportList>(
    `/quotes/${quoteId}/damage-reports`,
  )
  return data
}

export async function createDamagePhotoUploads(
  quoteId: string,
  body: Schemas['DamagePhotoUploadCreate'],
  signal?: AbortSignal,
) {
  const { data } = await api.post<Schemas['ProofPhotoUploadList']>(
    `/quotes/${quoteId}/damage-reports/uploads`,
    body,
    { signal },
  )
  return data.items
}

export async function createDamageReport(
  quoteId: string,
  body: DamageReportCreate,
) {
  const { data } = await api.post<DamageReport>(
    `/quotes/${quoteId}/damage-reports`,
    body,
  )
  return data
}
