import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { isApiError } from '@/lib/api-error'

export function useQuoteNotFound(error: unknown, listPath: string) {
  const router = useRouter()
  const isNotFound =
    isApiError(error) && (error.status === 400 || error.status === 404)

  useEffect(() => {
    if (!isNotFound) return

    toast.error(TOAST_MESSAGES.quote.notFound, { id: 'quote-not-found' })
    router.replace(listPath)
  }, [isNotFound, router, listPath])

  return isNotFound
}
