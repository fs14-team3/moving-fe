'use client'

import { useParams } from 'next/navigation'
import MoveProgressSection from '@/components/move-progress/MoveProgressSection'
import { LoadError, Loading } from '@/components/my-quotes/PageState'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import ProofPhotoSection from '@/components/proof-photos/ProofPhotoSection'
import {
  ConfirmedLabel,
  QuoteDetailHeader,
  QuoteInfo,
  QuotePrice,
} from '@/components/quotes/QuoteDetail'
import { useQuoteNotFound } from '@/features/my-quotes/hooks/useQuoteNotFound'
import { toCustomerName } from '@/features/received-requests/format'
import { useSentQuote } from '@/features/sent-quotes/hooks/useSentQuote'
import { isMoveCompleted } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'

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

  const isConfirmed = quote.status === 'CONFIRMED'

  return (
    <div className="bg-gray-50">
      <QuoteDetailHeader />

      <div className="px-5 pt-6 pb-20 md:px-18 md:pt-8 lg:mx-auto lg:max-w-338.5 lg:pt-10">
        <article>
          <header className="flex flex-col gap-3 border-b border-line-100 pb-3 md:pb-5">
            <QuoteBadges
              moveType={quote.moveRequest.moveType}
              isDesignated={quote.isDesignated}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg leading-6 font-semibold md:text-2xl md:leading-8">
                {toCustomerName(quote.moveRequest)}
              </p>
              {isConfirmed && <ConfirmedLabel />}
            </div>
          </header>

          <QuotePrice price={quote.price} />
          <QuoteInfo
            moveRequest={quote.moveRequest}
            className={cn(isConfirmed && 'border-b border-line-100')}
          />
          {isConfirmed && (
            <MoveProgressSection
              quoteId={quote.id}
              moveDate={quote.moveRequest.moveDate}
              className="border-b border-line-100"
            />
          )}
          {isConfirmed && (
            <ProofPhotoSection
              quoteId={quote.id}
              emptyMessage={
                isMoveCompleted(quote.moveRequest)
                  ? '고객님이 리뷰를 작성해 작업 사진을 올릴 수 없어요.'
                  : '이사일 다음 날부터 작업 사진을 올릴 수 있어요.'
              }
            />
          )}
        </article>
      </div>
    </div>
  )
}
