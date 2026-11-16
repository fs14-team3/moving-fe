'use client'

import { useParams } from 'next/navigation'
import { LoadError, Loading } from '@/components/my-quotes/PageState'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import {
  ConfirmedLabel,
  QuoteDetailHeader,
  QuoteInfo,
  QuotePrice,
} from '@/components/quotes/QuoteDetail'
import { useQuoteNotFound } from '@/features/my-quotes/hooks/useQuoteNotFound'
import { toCustomerName } from '@/features/received-requests/format'
import { useSentQuote } from '@/features/sent-quotes/hooks/useSentQuote'

export default function SentQuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { quote, error, isPending, isError, refetch, isRefetching } =
    useSentQuote(id)
  const isNotFound = useQuoteNotFound(error, '/mover/quotes')

  if (isPending) {
    return <Loading fullPage label="견적 정보를 불러오고 있습니다." />
  }

  if (isNotFound) return null

  if (isError && !quote) {
    return (
      <LoadError
        fullPage
        message="견적 정보를 불러오지 못했습니다."
        isRetrying={isRefetching}
        onRetry={() => refetch()}
      />
    )
  }

  if (!quote) return null

  return (
    <div className="bg-gray-50">
      <QuoteDetailHeader />

      <div className="px-5 pt-6 pb-20 md:px-18 md:pt-8 lg:mx-auto lg:max-w-338.5 lg:pt-10">
        <article className="lg:max-w-191.5">
          <header className="flex flex-col gap-3 border-b border-line-100 pb-3 md:pb-5">
            <QuoteBadges
              moveType={quote.moveRequest.moveType}
              isDesignated={quote.isDesignated}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg leading-6 font-semibold md:text-2xl md:leading-8">
                {toCustomerName(quote.moveRequest)}
              </p>
              {quote.status === 'CONFIRMED' && <ConfirmedLabel />}
            </div>
          </header>

          <QuotePrice price={quote.price} />
          <QuoteInfo moveRequest={quote.moveRequest} />
        </article>
      </div>
    </div>
  )
}
