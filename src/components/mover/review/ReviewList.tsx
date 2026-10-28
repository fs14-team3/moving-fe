import type { Review } from '@/features/movers/types'
import ReviewCard from './ReviewCard'

type ReviewListProps = {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center md:min-h-80">
        <p className="text-sm text-gray-400 md:text-base">
          아직 작성된 리뷰가 없습니다.
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
