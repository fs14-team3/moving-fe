import type { QuoteDetail } from '../api'

export const MOCK_QUOTE_DETAIL: QuoteDetail = {
  id: 'quote-1',
  price: 180000,
  comment: null,
  status: 'SUBMITTED',
  isDesignated: true,
  createdAt: '2026-11-05T09:00:00.000Z',
  confirmedAt: null,
  mover: {
    id: 'mover-quote-1',
    nickname: '김코드',
    imageUrl: null,
    intro: '고객님의 물품을 안전하게 운송해 드립니다.',
    description: '고객님의 물품을 안전하게 운송해 드립니다.',
    careerYears: 7,
    serviceTypes: ['SMALL'],
    averageRating: 5,
    reviewCount: 178,
    confirmedCount: 334,
    isFavorite: true,
    favoriteCount: 136,
    regions: ['서울'],
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    isDesignated: true,
  },
  moveRequest: {
    id: 'request-1',
    moveType: 'SMALL',
    moveDate: '2026-11-20',
    details: null,
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

export const MOCK_QUOTE_COMPARISON = {
  selectedKeywords: ['PRICE', 'PUNCTUALITY'],
  quotes: [
    {
      id: 'quote-1',
      price: 280000,
      comment:
        '포장부터 운반까지 직접 하고, 도착 후 가구 배치까지 맞춰 드리겠습니다.',
      mover: {
        nickname: '정다운 운반',
        careerYears: 8,
        averageRating: 4.9,
        reviewCount: 24,
        reviewSummary:
          '시간 약속을 잘 지키고 짐 포장이 꼼꼼하다는 후기가 많아요. 응대가 친절하고 진행 상황을 잘 알려 줬다는 이야기도 있어요.',
        aspects: [
          {
            key: 'PUNCTUALITY',
            mentionCount: 15,
            positiveCount: 14,
            negativeCount: 1,
          },
          {
            key: 'HANDLING',
            mentionCount: 12,
            positiveCount: 11,
            negativeCount: 1,
          },
          { key: 'SPEED', mentionCount: 6, positiveCount: 4, negativeCount: 2 },
          {
            key: 'COMMUNICATION',
            mentionCount: 9,
            positiveCount: 8,
            negativeCount: 1,
          },
          { key: 'PRICE', mentionCount: 5, positiveCount: 3, negativeCount: 2 },
        ],
      },
    },
    {
      id: 'quote-2',
      price: 330000,
      comment:
        '원룸 이사라 짐이 많지 않아 반나절이면 충분합니다. 엘리베이터 사용이 어려우면 사전에 말씀해 주세요. 파손 우려가 있는 가전은 별도로 포장하고, 도착 후에 배치 위치만 정해 주시면 그 자리에 맞춰 두겠습니다. 추가 비용은 현장에서 짐이 늘어난 경우에만 안내드립니다.',
      mover: {
        nickname: '전국길 권기사',
        careerYears: 5,
        averageRating: 4.6,
        reviewCount: 12,
        reviewSummary:
          '작업이 빠르고 약속 시간을 잘 지킨다는 후기가 많아요. 일부 후기에서는 설명이 짧았다는 의견이 있어요.',
        aspects: [
          {
            key: 'PUNCTUALITY',
            mentionCount: 7,
            positiveCount: 6,
            negativeCount: 1,
          },
          {
            key: 'HANDLING',
            mentionCount: 3,
            positiveCount: 2,
            negativeCount: 1,
          },
          { key: 'SPEED', mentionCount: 8, positiveCount: 8, negativeCount: 0 },
          {
            key: 'COMMUNICATION',
            mentionCount: 4,
            positiveCount: 2,
            negativeCount: 2,
          },
          { key: 'PRICE', mentionCount: 3, positiveCount: 1, negativeCount: 2 },
        ],
      },
    },
    {
      id: 'quote-3',
      price: 360000,
      comment: null,
      mover: {
        nickname: '길따라 홍기사',
        careerYears: 3,
        averageRating: 4.2,
        reviewCount: 4,
        reviewSummary: null,
        aspects: null,
      },
    },
  ],
  recommendation: {
    quoteId: ['quote-1'],
    reason: '가격이 가장 낮고, 시간 약속을 잘 지킨다는 후기가 가장 많아요.',
  },
}
