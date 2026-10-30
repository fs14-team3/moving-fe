import type { Mover, MoverDetail } from '../types'

export const MOCK_MOVERS = [
  {
    id: '1',
    nickname: '김무빙',
    imageUrl: null,
    intro: '꼼꼼하고 안전한 이사를 약속드립니다.',
    description: '8년차 기사 김무빙입니다.',
    careerYears: 8,
    serviceTypes: ['SMALL', 'HOME'],
    averageRating: 4.9,
    reviewCount: 248,
    confirmedCount: 182,
    isFavorite: true,
    favoriteCount: 231,
  },
  {
    id: '2',
    nickname: '이친절',
    imageUrl: null,
    intro: '고객님의 소중한 짐을 내 물건처럼 운반하겠습니다.',
    description: '5년차 기사 이친절입니다.',
    careerYears: 5,
    serviceTypes: ['HOME', 'OFFICE'],
    averageRating: 4.8,
    reviewCount: 132,
    confirmedCount: 97,
    isFavorite: false,
    favoriteCount: 130,
  },
  {
    id: '3',
    nickname: '박신속',
    imageUrl: null,
    intro: '빠르고 정확한 이사를 합리적인 가격으로 도와드립니다.',
    description: '12년차 기사 박신속입니다.',
    careerYears: 12,
    serviceTypes: ['SMALL', 'HOME', 'OFFICE'],
    averageRating: 4.7,
    reviewCount: 315,
    confirmedCount: 264,
    isFavorite: true,
    favoriteCount: 293,
  },
  {
    id: '4',
    nickname: '최안전',
    imageUrl: null,
    intro: '파손 걱정 없이 안전하게 운반해 드립니다.',
    description: '3년차 기사 최안전입니다.',
    careerYears: 3,
    serviceTypes: ['SMALL'],
    averageRating: 4.6,
    reviewCount: 67,
    confirmedCount: 48,
    isFavorite: true,
    favoriteCount: 20,
  },
] satisfies Mover[]

const MOCK_MOVER_DETAIL_FIELDS: Record<
  string,
  Pick<MoverDetail, 'regions' | 'isDesignated'>
> = {
  '1': {
    regions: ['서울', '경기'],
    isDesignated: false,
  },
  '2': {
    regions: ['서울', '인천'],
    isDesignated: false,
  },
  '3': {
    regions: ['경기', '인천'],
    isDesignated: true,
  },
  '4': {
    regions: ['서울'],
    isDesignated: null,
  },
}

export const MOCK_MOVER_DETAILS = MOCK_MOVERS.map((mover) => {
  const detailFields = MOCK_MOVER_DETAIL_FIELDS[mover.id]

  return {
    ...mover,
    regions: detailFields?.regions ?? null,
    isDesignated: detailFields?.isDesignated ?? null,
  }
}) satisfies MoverDetail[]
