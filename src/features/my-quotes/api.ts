import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'
import type { Mover } from '@/features/movers/types'

type Schemas = components['schemas']

// TODO: 기사님 정보에 찜 수(favoriteCount)가 아직 명세에 없어 기사님 찾기와 같은 확장 타입을 쓴다.
// BE 응답에 들어오면 Schemas['CustomerQuote']만 쓴다.
export type CustomerQuote = Omit<Schemas['CustomerQuote'], 'mover'> & {
  mover: Mover
}

export type QuoteDetail = Omit<Schemas['QuoteDetail'], 'mover'> & {
  mover: Mover
}

type RequestQuoteQuery = NonNullable<
  operations['listQuotesForRequest']['parameters']['query']
>

type RequestQuoteListResponse = {
  items: CustomerQuote[]
}

// 한 요청에 견적은 최대 8개라 페이지 없이 한 번에 받는다.
export async function getRequestQuotes(
  requestId: string,
  query: RequestQuoteQuery = {},
) {
  const { data } = await api.get<RequestQuoteListResponse>(
    `/move-requests/${requestId}/quotes`,
    { params: query },
  )
  return data
}

// 받았던 견적. 지난 요청마다 받은 견적 전체가 함께 온다.
export type QuoteHistoryItem = Omit<
  Schemas['MoveRequestWithQuotes'],
  'quotes'
> & {
  quotes: CustomerQuote[]
}

type QuoteHistoryQuery = NonNullable<
  operations['listMoveRequestHistory']['parameters']['query']
>

type QuoteHistoryPage = Schemas['CursorMeta'] & {
  items: QuoteHistoryItem[]
}

export async function getQuoteHistory(query: QuoteHistoryQuery = {}) {
  const { data } = await api.get<QuoteHistoryPage>('/move-requests/history', {
    params: query,
  })
  return data
}

export async function confirmQuote(quoteId: string) {
  const { data } = await api.post<Schemas['QuoteDetail']>(
    `/quotes/${quoteId}/confirm`,
  )
  return data
}
