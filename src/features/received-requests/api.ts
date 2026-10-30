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
