import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import {
  createDamageReport,
  type DamageReportCreate,
  type DamageReportList,
} from '@/features/damage-reports/api'
import { isApiError, isClientError, isUnauthorized } from '@/lib/api-error'
import { queryKeys } from '@/lib/queryKeys'

const ERROR_MESSAGES: Record<string, string> = {
  DAMAGE_REPORT_NOT_ALLOWED: TOAST_MESSAGES.damageReport.notAllowed,
  DAMAGE_REPORT_CONFLICT: TOAST_MESSAGES.damageReport.conflict,
  DAMAGE_PHOTO_NOT_UPLOADED: TOAST_MESSAGES.damageReport.photoExpired,
}

export function isPhotoExpired(error: unknown) {
  return isApiError(error) && error.code === 'DAMAGE_PHOTO_NOT_UPLOADED'
}

export function useCreateDamageReport(quoteId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.damageReports.list(quoteId)

  return useMutation({
    mutationFn: (body: DamageReportCreate) => createDamageReport(quoteId, body),
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    onSuccess: async (report) => {
      toast.success(TOAST_MESSAGES.damageReport.createSuccess)
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<DamageReportList>(queryKey, (list) =>
        list && !list.items.some(({ id }) => id === report.id)
          ? { ...list, items: [report, ...list.items] }
          : list,
      )
    },
    onError: (error) => {
      if (isUnauthorized(error)) return
      toast.error(
        (isApiError(error) && ERROR_MESSAGES[error.code]) ||
          TOAST_MESSAGES.damageReport.createFailed,
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
