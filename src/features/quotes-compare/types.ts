import type { components } from '@/lib/api-schema'

type Schema = components['schemas']

// TODO: API 타입 갱신 후 갱신
export type ComparisonKeyword =
  'PRICE' | 'CAREER' | 'PUNCTUALITY' | 'HANDLING' | 'SPEED' | 'COMMUNICATION'

export type QuoteComparisonRequest = {
  quoteIds: string[]
  keywords: ComparisonKeyword[]
}

// TODO: API 타입 갱신 후 갱신
export type QuoteComparisonMover = {
  nickname: string | null
  careerYears: number | null
  averageRating: number
  reviewCount: number
  reviewSummary: string | null
  aspects: Schema['ReviewSummaryAspect'][] | null
}

export type QuoteComparisonQuote = {
  id: string
  price: number
  comment: string | null
  mover: QuoteComparisonMover
}

export type QuoteRecommendation = {
  quoteIds: string[]
  reason: string
}

export type QuoteComparison = {
  quotes: QuoteComparisonQuote[]
  recommendation: QuoteRecommendation
}
