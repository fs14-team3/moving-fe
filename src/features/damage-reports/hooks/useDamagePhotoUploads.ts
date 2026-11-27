import { createDamagePhotoUploads } from '@/features/damage-reports/api'
import { usePhotoUploads } from '@/features/proof-photos/hooks/usePhotoUploads'
import { isApiError, isClientError } from '@/lib/api-error'

function toFailure(error: unknown) {
  if (isApiError(error) && error.code === 'DAMAGE_REPORT_NOT_ALLOWED') {
    return { error: '접수 기간이 아니에요', retryable: false }
  }
  return { error: '올리지 못했어요', retryable: !isClientError(error) }
}

export function useDamagePhotoUploads(quoteId: string) {
  return usePhotoUploads({
    createUploads: (body, signal) =>
      createDamagePhotoUploads(quoteId, body, signal),
    toFailure,
  })
}
