'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import Button from '@/components/common/button/Button'
import { LoadError, Loading, PageBody } from '@/components/my-quotes/PageState'
import MyReviewCard from '@/components/reviews/MyReviewCard'
import { useMyReviews } from '@/features/reviews/hooks/useMyReviews'

function NoMyReviews() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 lg:py-32">
      <Image
        src="/assets/images/empty-without-text.png"
        width={240}
        height={240}
        alt=""
        className="size-45 md:size-60"
      />
      <p className="text-base text-gray-400 lg:text-lg">
        아직 등록된 리뷰가 없어요!
      </p>
      <Button href="/my-reviews" className="w-60 lg:w-60">
        리뷰 작성하러 가기
      </Button>
    </div>
  )
}

function MyReviewList() {
  const {
    myReviews,
    hasData,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMyReviews()
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

  if (isPending)
    return <Loading label="내가 작성한 리뷰를 불러오고 있습니다." />

  // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
  if (isError && !hasData) {
    return (
      <LoadError
        message="내가 작성한 리뷰를 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    )
  }

  if (myReviews.length === 0) return <NoMyReviews />

  return (
    <>
      <ul className="flex flex-col gap-4 lg:gap-6">
        {myReviews.map((review) => (
          <li key={review.id}>
            <MyReviewCard review={review} />
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} />
      {/* 다시 시도하는 동안에는 실패 상태가 남아 있어서 불러오는 중을 먼저 확인한다. */}
      {isFetchingNextPage ? (
        <Loading label="내가 작성한 리뷰를 더 불러오고 있습니다." />
      ) : (
        isFetchNextPageError && (
          <div role="alert" className="flex flex-col items-center gap-4 py-10">
            <p className="text-sm font-semibold text-black-400 lg:text-base">
              내가 작성한 리뷰를 더 불러오지 못했습니다.
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

export default function WrittenReviewsPage() {
  return (
    <PageBody>
      <MyReviewList />
    </PageBody>
  )
}
