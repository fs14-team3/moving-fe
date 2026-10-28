import type { Review } from '../types'

// TODO: 리뷰 작성자 이름의 마스킹 방식과 null 표시 문구 확정 후 반영
export const MOCK_REVIEWS = [
  {
    id: '1',
    rating: 5,
    content: '시간 약속을 잘 지켜주시고 짐도 꼼꼼하게 옮겨주셔서 만족했습니다.',
    customerName: '김코드',
    createdAt: '2026-10-20T10:30:00.000Z',
  },
  {
    id: '2',
    rating: 4.5,
    content: '친절하게 설명해 주시고 이사도 안전하게 진행해 주셨습니다.',
    customerName: '이코드',
    createdAt: '2026-10-15T14:20:00.000Z',
  },
  {
    id: '3',
    rating: 4,
    content: '전체적으로 만족스러웠고 다음에도 이용하고 싶습니다.',
    customerName: '박코드',
    createdAt: '2026-10-08T09:10:00.000Z',
  },
  {
    id: '4',
    rating: 3.5,
    content: '이사 과정은 만족스러웠지만 도착 시간이 조금 늦었습니다.',
    customerName: null,
    createdAt: '2026-09-28T16:40:00.000Z',
  },
] satisfies Review[]
