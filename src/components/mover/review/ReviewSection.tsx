'use client'

import Button from '@/components/common/button/Button'
import Pagination from '@/components/common/pagination/Pagination'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'
import type { MoverDetail } from '@/features/movers/types'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import RatingDistribution from './RatingDistribution'
import RatingStars from './RatingStars'
import ReviewList from './ReviewList'

type ReviewSectionProps = {
  mover: Pick<
    MoverDetail,
    'id' | 'averageRating' | 'reviewCount' | 'ratingCounts'
  >
}

const PAGE_SIZE = 5

export default function ReviewSection({ mover }: ReviewSectionProps) {
  const [page, setPage] = useState(1)

  const {
    reviews,
    totalCount,
    totalPages,
    isPending,
    isFetching,
    isError,
    isPlaceholderData,
    refetch,
  } = useMoverReviews(mover.id, {
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <section className="flex flex-col gap-4 lg:border-t lg:border-line-100 lg:pt-10">
      <h2 className="text-xl leading-8 font-semibold">리뷰</h2>

      {isPending ? (
        <div
          role="status"
          className="flex min-h-60 flex-col items-center justify-center gap-4 md:min-h-80"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-8 animate-spin text-primary-400"
          />
          <p className="text-base text-gray-400 md:text-lg">
            리뷰를 불러오고 있습니다.
          </p>
        </div>
      ) : isError ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-4 md:min-h-80">
          <p role="alert" className="text-base text-gray-400 md:text-lg">
            리뷰를 불러오지 못했습니다.
          </p>
          <Button
            variant="outlined"
            disabled={isFetching}
            onClick={() => refetch()}
            className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto"
          >
            다시 시도
          </Button>
        </div>
      ) : totalCount === 0 ? (
        <ReviewList reviews={[]} />
      ) : (
        <>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-[18px]">
              <p className="text-4xl font-medium">{mover.averageRating}</p>
              <div>
                <RatingStars rating={mover.averageRating} isDecorative />
                <p className="text-sm leading-6 font-normal text-gray-500">
                  {totalCount}개의 리뷰
                </p>
              </div>
            </div>

            <RatingDistribution
              ratingCounts={mover.ratingCounts}
              totalCount={mover.reviewCount}
            />
          </div>

          <div className="relative">
            <ReviewList reviews={reviews} />

            {isPlaceholderData && (
              <div
                role="status"
                className="absolute inset-0 flex items-center justify-center bg-white/60"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-8 animate-spin text-primary-400"
                />
                <span className="sr-only">리뷰를 불러오는 중입니다.</span>
              </div>
            )}
          </div>

          <div className="mt-9 mb-6 flex justify-center lg:mt-27 lg:mb-38">
            <Pagination
              page={page}
              onPageChange={setPage}
              totalPage={totalPages}
              disabled={isPlaceholderData}
            />
          </div>
        </>
      )}
    </section>
  )
}
