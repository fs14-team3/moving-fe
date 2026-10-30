import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ReceivedRequest = Schemas['RequestForMover']

export type ReceivedRequestSort = Schemas['ReceivedRequestSort']

export type ReceivedRequestQuery = NonNullable<
  operations['listReceivedRequests']['parameters']['query']
>

// 전체 건수는 아직 명세에 없어서 응답에 있을 때만 '전체 N건'으로 보여준다.
type ReceivedRequestPage = Schemas['ReceivedRequestListResponse'] & {
  totalCount?: number
}

export type QuoteCreate = Schemas['QuoteCreate']

export async function getReceivedRequests(query: ReceivedRequestQuery) {
  const { data } = await api.get<ReceivedRequestPage>(
    '/movers/me/received-requests',
    {
      params: query,
      // 배열은 moveTypes=SMALL&moveTypes=HOME 형태로 보낸다.
      paramsSerializer: { indexes: null },
    },
  )
  return data
}

export async function sendQuote(requestId: string, body: QuoteCreate) {
  const { data } = await api.post<Schemas['SentQuote']>(
    `/move-requests/${requestId}/quotes`,
    body,
  )
  return data
}

// TODO: 견적 보내기 명세(QuoteCreate)에 코멘트가 없어 지금은 견적가만 보낸다.
// BE 명세에 comment가 추가되면 견적 보내기 모달에서 입력한 코멘트도 함께 보낸다.
