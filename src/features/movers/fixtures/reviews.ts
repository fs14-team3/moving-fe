import type { MoverReviewSummary, Review } from '../types'

export const MOCK_REVIEWS = [
  {
    id: '1',
    rating: 5,
    content: '시간 약속을 잘 지켜주시고 짐도 꼼꼼하게 옮겨주셔서 만족했습니다.',
    customerName: '김**',
    createdAt: '2026-10-20T10:30:00.000Z',
  },
  {
    id: '2',
    rating: 4,
    content: '친절하게 설명해 주시고 이사도 안전하게 진행해 주셨습니다.',
    customerName: '이**',
    createdAt: '2026-10-15T14:20:00.000Z',
  },
  {
    id: '3',
    rating: 4,
    content: '전체적으로 만족스러웠고 다음에도 이용하고 싶습니다.',
    customerName: '박**',
    createdAt: '2026-10-08T09:10:00.000Z',
  },
  {
    id: '4',
    rating: 3,
    content: '이사 과정은 만족스러웠지만 도착 시간이 조금 늦었습니다.',
    customerName: null,
    createdAt: '2026-09-28T16:40:00.000Z',
  },
  {
    id: '5',
    rating: 4,
    content: '전체적으로 만족스러웠고 다음에도 이용하고 싶습니다.',
    customerName: '박**',
    createdAt: '2026-10-08T09:10:00.000Z',
  },
  {
    id: '6',
    rating: 3,
    content: '이사 과정은 만족스러웠지만 도착 시간이 조금 늦었습니다.',
    customerName: null,
    createdAt: '2026-09-28T16:40:00.000Z',
  },
] satisfies Review[]

export const MOCK_REVIEW_SUMMARY = {
  reviewCount: 24,
  summary:
    '시간 약속을 잘 지키고 짐 포장이 꼼꼼하다는 후기와 응대가 친절하고 진행 상황을 잘 알려 줬다는 이야기가 많아요. 일부 후기에서는 작업이 생각보다 오래 걸렸거나 추가 비용이 발생했다는 의견이 있어요.',
  aspects: [
    {
      key: 'COMMUNICATION',
      mentionCount: 18,
      positiveCount: 14,
      negativeCount: 2,
    },
    { key: 'HANDLING', mentionCount: 15, positiveCount: 10, negativeCount: 4 },
    {
      key: 'PUNCTUALITY',
      mentionCount: 12,
      positiveCount: 9,
      negativeCount: 1,
    },
    { key: 'SPEED', mentionCount: 4, positiveCount: 3, negativeCount: 0 },
    { key: 'PRICE', mentionCount: 3, positiveCount: 1, negativeCount: 1 },
  ],
} satisfies MoverReviewSummary
