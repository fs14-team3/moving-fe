'use client'

import { CircleCheck, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Button from '@/components/common/button/Button'
import MoveRequestCard from '@/components/mover/MoveRequestCard'
import type { SentQuote } from '@/features/sent-quotes/api'
import { useSentQuotes } from '@/features/sent-quotes/hooks/useSentQuotes'
import { isMoveCompleted } from '@/features/sent-quotes/lib/status'

function Loading() {
  return (
    <div role="status" className="flex justify-center py-10">
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span className="sr-only">보낸 견적을 불러오고 있습니다.</span>
    </div>
  )
}

function ConfirmedLabel() {
  return (
    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-400 lg:text-base">
      <CircleCheck
        aria-hidden="true"
        className="size-4 fill-primary-400 text-white lg:size-5"
      />
      확정견적
    </span>
  )
}

function SentQuoteCard({ quote }: { quote: SentQuote }) {
  const isCompleted = isMoveCompleted(quote.moveRequest)

  return (
    <Link
      href={`/mover/quotes/${quote.id}`}
      className="relative block rounded-2xl focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:outline-none"
    >
      <MoveRequestCard
        request={quote.moveRequest}
        aside={quote.status === 'CONFIRMED' && <ConfirmedLabel />}
      >
        <div className="mt-4 flex items-center justify-between border-t border-line-100 pt-4 lg:mt-5 lg:pt-5">
          <span className="text-sm text-black-300 lg:text-base">견적 금액</span>
          <strong className="text-lg font-bold text-black-400 lg:text-2xl">
            {quote.price.toLocaleString('ko-KR')}원
          </strong>
        </div>
      </MoveRequestCard>
      {/* 이사가 끝난 견적은 카드 위를 어둡게 덮는다. 카드 전체가 상세보기 링크라서 버튼 모양만 그린다. */}
      {isCompleted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black-400/60">
          <p className="text-base font-semibold text-white lg:text-lg">
            이사 완료된 견적이에요
          </p>
          <span className="rounded-lg border border-primary-400 bg-primary-100 px-6 py-2.5 text-sm font-semibold text-primary-400 lg:px-10 lg:py-3 lg:text-base">
            견적 상세보기
          </span>
        </div>
      )}
    </Link>
  )
}

export default function SentQuotesPage() {
  const {
    sentQuotes,
    hasData,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useSentQuotes()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 목록 끝에 둔 요소가 보이면 다음 페이지를 불러온다.
  // 다음 페이지가 실패하면 감시를 멈추고 다시 시도 버튼으로만 불러온다.
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError)
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage()
      },
      // 끝에 닿기 조금 전에 미리 불러온다.
      { rootMargin: '200px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  if (isPending) return <Loading />

  // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
  if (isError && !hasData) {
    return (
      <div role="alert" className="flex flex-col items-center gap-6 py-20">
        <p className="text-base font-semibold text-black-400 lg:text-lg">
          보낸 견적을 불러오지 못했습니다.
        </p>
        <Button
          variant="outlined"
          onClick={() => refetch()}
          className="w-auto px-8 lg:w-auto"
        >
          다시 시도
        </Button>
      </div>
    )
  }

  if (sentQuotes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 lg:py-32">
        <Image
          src="/assets/images/truck.webp"
          alt=""
          width={870}
          height={658}
          className="h-auto w-45 opacity-40 grayscale md:w-60"
        />
        <p className="text-base text-gray-400 lg:text-lg">
          아직 보낸 견적이 없어요
        </p>
      </div>
    )
  }

  return (
    <>
      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {sentQuotes.map((quote) => (
          <li key={quote.id}>
            <SentQuoteCard quote={quote} />
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} />
      {/* 다시 시도하는 동안에는 실패 상태가 남아 있어서 불러오는 중을 먼저 확인한다. */}
      {isFetchingNextPage ? (
        <Loading />
      ) : (
        isFetchNextPageError && (
          <div role="alert" className="flex flex-col items-center gap-4 py-10">
            <p className="text-sm font-semibold text-black-400 lg:text-base">
              보낸 견적을 더 불러오지 못했습니다.
            </p>
            <Button
              variant="outlined"
              onClick={() => fetchNextPage()}
              className="w-auto px-8 lg:w-auto"
            >
              다시 시도
            </Button>
          </div>
        )
      )}
    </>
  )
}
