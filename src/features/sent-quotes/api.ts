import api from '@/lib/api'
import type { components } from '@/lib/api-schema'

type Schemas = components['schemas']

export type SentQuote = Schemas['SentQuote']

type SentQuoteStatus = Schemas['QuoteStatus']

// TODO(#85): 보낸 견적 목록(GET /movers/me/quotes)이 아직 명세에 없어 BE PR #64 코드를 보고 맞춰 둔 타입이다.
// 명세가 들어오면 api:types를 다시 생성하고 operations['…']['parameters']['query']와 생성된 응답 타입으로 바꾼다.
export type SentQuoteQuery = {
  cursor?: string
  limit?: number
  status?: SentQuoteStatus
}

type SentQuoteListResponse = Schemas['CursorMeta'] & {
  items: SentQuote[]
}

export async function getSentQuotes(query: SentQuoteQuery = {}) {
  const { data } = await api.get<SentQuoteListResponse>('/movers/me/quotes', {
    params: query,
  })
  return data
}
