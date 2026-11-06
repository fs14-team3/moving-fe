'use client'

import { useEffect, useRef } from 'react'
import Button from '@/components/common/button/Button'
import {
  Empty,
  LoadError,
  Loading,
  PageBody,
} from '@/components/my-quotes/PageState'
import QuoteHistoryCard from '@/components/my-quotes/QuoteHistoryCard'
import { useQuoteHistory } from '@/features/my-quotes/hooks/useQuoteHistory'

function QuoteHistoryList() {
  const {
    history,
    hasData,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useQuoteHistory()
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

  if (isPending) return <Loading label="받았던 견적을 불러오고 있습니다." />

  // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
  if (isError && !hasData) {
    return (
      <LoadError
        message="받았던 견적을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    )
  }

  if (history.length === 0) {
    return (
      <Empty>
        <p className="text-base text-gray-400 lg:text-lg">
          아직 받았던 견적이 없어요
        </p>
      </Empty>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-6 lg:gap-8">
        {history.map((request) => (
          <li key={request.id}>
            <QuoteHistoryCard request={request} />
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} />
      {/* 다시 시도하는 동안에는 실패 상태가 남아 있어서 불러오는 중을 먼저 확인한다. */}
      {isFetchingNextPage ? (
        <Loading label="받았던 견적을 더 불러오고 있습니다." />
      ) : (
        isFetchNextPageError && (
          <div role="alert" className="flex flex-col items-center gap-4 py-10">
            <p className="text-sm font-semibold text-black-400 lg:text-base">
              받았던 견적을 더 불러오지 못했습니다.
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

export default function QuoteHistoryPage() {
  return (
    <PageBody>
      <QuoteHistoryList />
    </PageBody>
  )
}
