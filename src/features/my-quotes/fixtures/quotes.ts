import type { QuoteDetail } from '../api'

export const MOCK_QUOTE_DETAIL: QuoteDetail = {
  id: 'quote-1',
  price: 180000,
  status: 'SUBMITTED',
  isDesignated: true,
  createdAt: '2026-11-05T09:00:00.000Z',
  confirmedAt: null,
  mover: {
    id: 'mover-quote-1',
    nickname: '김코드',
    imageUrl: null,
    intro: '고객님의 물품을 안전하게 운송해 드립니다.',
    careerYears: 7,
    serviceTypes: ['SMALL'],
    averageRating: 5,
    reviewCount: 178,
    confirmedCount: 334,
    isFavorite: true,
    favoriteCount: 136,
  },
  moveRequest: {
    id: 'request-1',
    moveType: 'SMALL',
    moveDate: '2026-11-20',
    from: {
      address: '서울특별시 중구 세종대로 110',
      zonecode: '04524',
      region: '서울',
    },
    to: {
      address: '부산광역시 해운대구 해운대로 1',
      zonecode: '48094',
      region: '부산',
    },
    status: 'PENDING',
    quoteCount: 2,
    designatedMoverIds: ['mover-quote-1'],
    createdAt: '2026-11-04T12:00:00.000Z',
    confirmedAt: null,
  },
}

// export const MOCK_CONFIRMED_QUOTE_DETAIL: QuoteDetail = {
//   ...MOCK_QUOTE_DETAIL,
//   status: 'CONFIRMED',
//   confirmedAt: '2026-11-06T03:00:00.000Z',
//   moveRequest: {
//     ...MOCK_QUOTE_DETAIL.moveRequest,
//     status: 'CONFIRMED',
//     confirmedAt: '2026-11-06T03:00:00.000Z',
//   },
// }
