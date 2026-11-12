import type { SentQuote } from '@/features/sent-quotes/api'

export const MOCK_SENT_QUOTE: SentQuote = {
  id: 'quote-1',
  price: 180000,
  status: 'SUBMITTED',
  isDesignated: true,
  createdAt: '2026-11-01T09:00:00.000Z',
  moveRequest: {
    id: 'request-1',
    customerName: '김민서',
    moveType: 'SMALL',
    moveDate: '2026-11-20',
    from: { address: '서울특별시 중구 세종대로 110', region: '서울' },
    to: { address: '경기도 수원시 팔달구 효원로 1', region: '경기' },
    status: 'PENDING',
    isDesignated: true,
    createdAt: '2026-10-30T09:00:00.000Z',
  },
}
