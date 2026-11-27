import api from '@/lib/api'
import type { components, operations } from '@/lib/api-schema'

type Schemas = components['schemas']

export type ReviewTarget = Schemas['ReviewTarget']

export type WritableReviewQuery = NonNullable<
  operations['listWritableReviews']['parameters']['query']
>

type WritableReviewPage = Schemas['OffsetMeta'] & {
  items: ReviewTarget[]
}

export type MyReview = Schemas['MyReview']

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
