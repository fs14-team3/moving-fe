import type { operations } from '@/lib/api-schema'

// 조회 API가 받는 query 파라미터. 쿼리 키에 그대로 넣어서 조건이 바뀌면 다시 불러온다.
type Query<T extends keyof operations> = NonNullable<
  operations[T]['parameters']['query']
>

// 무한 스크롤 목록은 cursor가 페이지마다 바뀌므로 키에서 뺀다.
type ListQuery<T extends keyof operations> = Omit<Query<T>, 'cursor'>

// 도메인마다 all → lists → list(조건) / detail(id) 순서로 키를 만든다.
// 앞부분 키로 무효화하면 그 아래 키가 모두 함께 무효화된다.
// 예: queryKeys.movers.lists()를 무효화하면 조건과 관계없이 기사님 목록을 모두 다시 불러온다.
export const queryKeys = {
  // GET /users/me
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
  },

  movers: {
    all: ['movers'] as const,
    lists: () => [...queryKeys.movers.all, 'list'] as const,
    // GET /movers
    list: (query: ListQuery<'listMovers'> = {}) =>
      [...queryKeys.movers.lists(), query] as const,
    // GET /movers/{moverId}
    detail: (moverId: string) =>
      [...queryKeys.movers.all, 'detail', moverId] as const,
    // GET /movers/{moverId}/reviews
    // 찜하기처럼 상세만 바뀔 때 리뷰까지 다시 불러오지 않도록 detail 아래에 두지 않는다.
    reviews: (moverId: string, query: Query<'listMoverReviews'> = {}) =>
      [...queryKeys.movers.all, 'reviews', moverId, query] as const,
    // GET /movers/me (기사님 마이페이지)
    me: () => [...queryKeys.movers.all, 'me'] as const,
  },

  favorites: {
    all: ['favorites'] as const,
    // GET /customers/me/favorites
    list: (query: ListQuery<'listMyFavorites'> = {}) =>
      [...queryKeys.favorites.all, 'list', query] as const,
  },

  moveRequests: {
    all: ['moveRequests'] as const,
    // GET /move-requests/active
    active: () => [...queryKeys.moveRequests.all, 'active'] as const,
    // GET /move-requests/history
    history: (query: ListQuery<'listMoveRequestHistory'> = {}) =>
      [...queryKeys.moveRequests.all, 'history', query] as const,
    // GET /move-requests/{requestId}
    detail: (requestId: string) =>
      [...queryKeys.moveRequests.all, 'detail', requestId] as const,
    // GET /move-requests/{requestId}/quotes
    // 견적을 확정하면 요청 상세와 받은 견적이 함께 바뀌어서 detail 아래에 둔다.
    quotes: (requestId: string, query: Query<'listQuotesForRequest'> = {}) =>
      [...queryKeys.moveRequests.detail(requestId), 'quotes', query] as const,
  },

  // 기사님이 받은 요청
  receivedRequests: {
    all: ['receivedRequests'] as const,
    lists: () => [...queryKeys.receivedRequests.all, 'list'] as const,
    // GET /movers/me/received-requests
    list: (query: ListQuery<'listReceivedRequests'> = {}) =>
      [...queryKeys.receivedRequests.lists(), query] as const,
    // GET /movers/me/rejected-requests
    rejected: (query: ListQuery<'listMyRejectedRequests'> = {}) =>
      [...queryKeys.receivedRequests.all, 'rejected', query] as const,
  },

  quotes: {
    all: ['quotes'] as const,
    // GET /quotes/{quoteId}
    detail: (quoteId: string) =>
      [...queryKeys.quotes.all, 'detail', quoteId] as const,
  },

  // 일반 유저의 리뷰. 기사님이 받은 리뷰는 movers.reviews를 쓴다.
  reviews: {
    all: ['reviews'] as const,
    // GET /customers/me/reviews
    mine: (query: Query<'listMyReviews'> = {}) =>
      [...queryKeys.reviews.all, 'mine', query] as const,
    // GET /customers/me/reviews/writable
    writable: (query: Query<'listWritableReviews'> = {}) =>
      [...queryKeys.reviews.all, 'writable', query] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    // GET /notifications
    list: (query: ListQuery<'listNotifications'> = {}) =>
      [...queryKeys.notifications.all, 'list', query] as const,
  },
}
