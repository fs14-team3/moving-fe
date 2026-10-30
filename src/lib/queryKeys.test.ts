import { QueryClient, hashKey } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { queryKeys } from './queryKeys'

function createClient(keys: readonly (readonly unknown[])[]) {
  const queryClient = new QueryClient()
  for (const key of keys) queryClient.setQueryData(key, 'data')
  return queryClient
}

function isInvalidated(queryClient: QueryClient, key: readonly unknown[]) {
  return queryClient.getQueryState(key)?.isInvalidated ?? false
}

describe('queryKeys', () => {
  it('조건 순서가 달라도 같은 키로 본다', () => {
    expect(
      hashKey(queryKeys.movers.list({ keyword: '김', sort: 'RATING' })),
    ).toBe(hashKey(queryKeys.movers.list({ sort: 'RATING', keyword: '김' })))
  })

  it('lists()로 무효화하면 조건이 다른 목록이 모두 무효화된다', async () => {
    const byKeyword = queryKeys.movers.list({ keyword: '김' })
    const bySort = queryKeys.movers.list({ sort: 'RATING' })
    const detail = queryKeys.movers.detail('mover-1')
    const queryClient = createClient([byKeyword, bySort, detail])

    await queryClient.invalidateQueries({ queryKey: queryKeys.movers.lists() })

    expect(isInvalidated(queryClient, byKeyword)).toBe(true)
    expect(isInvalidated(queryClient, bySort)).toBe(true)
    expect(isInvalidated(queryClient, detail)).toBe(false)
  })

  it('기사님 상세를 무효화해도 받은 리뷰는 다시 불러오지 않는다', async () => {
    const detail = queryKeys.movers.detail('mover-1')
    const reviews = queryKeys.movers.reviews('mover-1', { page: 1 })
    const queryClient = createClient([detail, reviews])

    await queryClient.invalidateQueries({ queryKey: detail })

    expect(isInvalidated(queryClient, detail)).toBe(true)
    expect(isInvalidated(queryClient, reviews)).toBe(false)
  })

  it('견적 요청 상세를 무효화하면 그 요청의 받은 견적도 무효화된다', async () => {
    const detail = queryKeys.moveRequests.detail('request-1')
    const quotes = queryKeys.moveRequests.quotes('request-1')
    const otherQuotes = queryKeys.moveRequests.quotes('request-2')
    const queryClient = createClient([detail, quotes, otherQuotes])

    await queryClient.invalidateQueries({ queryKey: detail })

    expect(isInvalidated(queryClient, quotes)).toBe(true)
    expect(isInvalidated(queryClient, otherQuotes)).toBe(false)
  })
})
