'use client'

import Pagination from '@/components/common/pagination/Pagination'
import {
  MOCK_RATING_COUNTS,
  MOCK_REVIEWS,
} from '@/features/movers/mocks/reviews'
import type { Mover } from '@/features/movers/types'
import { useState } from 'react'
import RatingDistribution from './RatingDistribution'
import RatingStars from './RatingStars'
import ReviewList from './ReviewList'

type ReviewSectionProps = {
  mover: Mover
}

const PAGE_SIZE = 5

export default function ReviewSection({ mover }: ReviewSectionProps) {
  const [page, setPage] = useState(1)

  // TODO: 리뷰 API 연동 시 응답의 items, totalCount, totalPages, ratingCounts로 교체
  const totalCount = MOCK_REVIEWS.length
  const totalPage = Math.ceil(totalCount / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const currentReviews = MOCK_REVIEWS.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="flex flex-col gap-4 lg:border-t lg:border-line-100 lg:pt-10">
      <h2 className="text-xl leading-8 font-semibold">리뷰</h2>

      {totalCount === 0 ? (
        <ReviewList reviews={[]} />
      ) : (
        <>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-[18px]">
              <p className="text-4xl font-medium">{mover.averageRating}</p>
              <div>
                <RatingStars rating={mover.averageRating} isDecorative />
                <p className="text-sm leading-6 font-normal text-gray-500">
                  {mover.reviewCount}개의 리뷰
                </p>
              </div>
            </div>

            <RatingDistribution ratingCounts={MOCK_RATING_COUNTS} />
          </div>

          <ReviewList reviews={currentReviews} />

          <div className="mt-9 mb-6 flex justify-center lg:mt-27 lg:mb-38">
            <Pagination
              page={page}
              onPageChange={setPage}
              totalPage={totalPage}
            />
          </div>
        </>
      )}
    </section>
  )
}
