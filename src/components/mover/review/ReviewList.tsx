import type { Review } from '@/features/movers/types'
import ReviewCard from './ReviewCard'

type ReviewListProps = {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center md:min-h-80">
        <p className="text-base leading-7 font-semibold">
          아직 등록된 리뷰가 없어요!
        </p>
        <p className="text-sm leading-7 font-normal text-gray-400">
          가장 먼저 리뷰를 등록해보세요
        </p>
      </div>
    )
  }

  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  )
}
