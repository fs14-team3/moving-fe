'use client'

import Pagination from '@/components/common/pagination/Pagination'
import { useMoverReviews } from '@/features/movers/hooks/useMoverReviews'
import type { MoverDetail } from '@/features/movers/types'
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

  const { reviews, totalCount, totalPages, isPending, isError } =
    useMoverReviews(mover.id, {
      page,
      pageSize: PAGE_SIZE,
    })

  if (isPending) {
    return <p>리뷰를 불러오고 있습니다.</p>
  }

  if (isError) {
    return <p>리뷰를 불러오지 못했습니 다.</p>
  }

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

            <RatingDistribution
              ratingCounts={mover.ratingCounts}
              totalCount={mover.reviewCount}
            />
          </div>

          <ReviewList reviews={reviews} />

          <div className="mt-9 mb-6 flex justify-center lg:mt-27 lg:mb-38">
            <Pagination
              page={page}
              onPageChange={setPage}
              totalPage={totalPages}
            />
          </div>
        </>
      )}
    </section>
  )
}
