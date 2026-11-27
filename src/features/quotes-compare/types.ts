import type { components } from '@/lib/api-schema'

type Schema = components['schemas']

export type QuoteComparisonRequest = Schema['QuoteComparisonRequest']
export type ComparisonKeyword = QuoteComparisonRequest['keywords'][number]

export type QuoteComparisonQuote = Schema['QuoteComparisonQuote']
export type QuoteComparison = Schema['QuoteComparison']
