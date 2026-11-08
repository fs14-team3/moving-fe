import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ReceivedRequest = Schemas['RequestForMover']

export type ReceivedRequestSort = Schemas['ReceivedRequestSort']

export type ReceivedRequestQuery = NonNullable<
  operations['listReceivedRequests']['parameters']['query']
>

// TODO: 백엔드에 전체 건수(totalCount) 추가 요청. 명세에 들어오면 생성된 타입만 사용
// 아직 명세에 없어서 응답에 있을 때만 '전체 N건'으로 보여준다.
type ReceivedRequestPage = Schemas['ReceivedRequestListResponse'] & {
  totalCount?: number
}

export type QuoteCreate = Schemas['QuoteCreate']

export type RejectedRequest = Schemas['RejectedRequest']

type RejectedRequestQuery = NonNullable<
  operations['listMyRejectedRequests']['parameters']['query']
>

export async function getReceivedRequests(query: ReceivedRequestQuery) {
  const { data } = await api.get<ReceivedRequestPage>(
    '/movers/me/received-requests',
    { params: { ...query, moveTypes: query.moveTypes?.join(',') } },
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

export async function rejectRequest(requestId: string) {
  const { data } = await api.post<RejectedRequest>(
    `/move-requests/${requestId}/rejections`,
  )
  return data
}

export async function getRejectedRequests(query: RejectedRequestQuery = {}) {
  const { data } = await api.get<Schemas['RejectedRequestListResponse']>(
    '/movers/me/rejected-requests',
    { params: query },
  )
  return data
}

// TODO: 견적 보내기 명세(QuoteCreate)에 코멘트가 없어 지금은 견적가만 보낸다.
// BE 명세에 comment가 추가되면 견적 보내기 모달에서 입력한 코멘트도 함께 보낸다.

// TODO: 요청 반려 명세에 반려 사유가 없어 지금은 사유 없이 반려한다. (BE 명세 작성 중)
// BE 명세에 반려 사유가 추가되면 반려요청 모달에서 입력한 사유도 함께 보낸다.
