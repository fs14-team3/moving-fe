import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'
import type { Mover } from '@/features/movers/types'

type Schemas = components['schemas']

// TODO: 시안에는 출발지 · 도착지가 있는데 명세(ReviewTarget)에 없어서 BE에 추가 요청.
// 응답에 들어오면 확장 타입을 지우고 Schemas['ReviewTarget']만 쓴다.
export type ReviewTarget = Omit<Schemas['ReviewTarget'], 'mover'> & {
  mover: Mover
  from?: Schemas['Address']
  to?: Schemas['Address']
}

export type WritableReviewQuery = NonNullable<
  operations['listWritableReviews']['parameters']['query']
>

type WritableReviewPage = Schemas['OffsetMeta'] & {
  items: ReviewTarget[]
}

// 내가 쓴 리뷰도 ReviewTarget을 그대로 이어받아서 출발지 · 도착지가 같이 빠져 있다.
export type MyReview = ReviewTarget &
  Pick<Schemas['MyReview'], 'id' | 'rating' | 'content' | 'createdAt'>

export type MyReviewQuery = NonNullable<
  operations['listMyReviews']['parameters']['query']
>

type MyReviewPage = Schemas['OffsetMeta'] & {
  items: MyReview[]
}

export type ReviewCreate = Schemas['ReviewCreate']

export async function getMyReviews(query: MyReviewQuery = {}) {
  const { data } = await api.get<MyReviewPage>('/customers/me/reviews', {
    params: query,
  })
  return data
}

export async function getWritableReviews(query: WritableReviewQuery = {}) {
  const { data } = await api.get<WritableReviewPage>(
    '/customers/me/reviews/writable',
    { params: query },
  )
  return data
}

export async function createReview(body: ReviewCreate) {
  const { data } = await api.post<Schemas['MyReview']>('/reviews', body)
  return data
}
