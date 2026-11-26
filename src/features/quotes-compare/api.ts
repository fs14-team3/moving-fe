import api from '@/lib/api'
import type { QuoteComparison, QuoteComparisonRequest } from './types'

export async function compareQuotes(
  requestId: string,
  body: QuoteComparisonRequest,
) {
  const { data } = await api.post<QuoteComparison>(
    `/move-requests/${requestId}/quotes/compare`,
    body,
  )
  return data
}
