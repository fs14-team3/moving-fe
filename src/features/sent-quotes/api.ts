import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type SentQuote = Schemas['SentQuote']

export type SentQuoteQuery = NonNullable<
  operations['listMySentQuotes']['parameters']['query']
>

export async function getSentQuotes(query: SentQuoteQuery = {}) {
  const { data } = await api.get<Schemas['SentQuoteListResponse']>(
    '/movers/me/quotes',
    { params: query },
  )
  return data
}

export async function getSentQuote(quoteId: string) {
  const { data } = await api.get<SentQuote>(`/movers/me/quotes/${quoteId}`)
  return data
}
