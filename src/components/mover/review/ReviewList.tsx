import type { Review } from '@/features/movers/types'
import ReviewCard from './ReviewCard'

type ReviewListProps = {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p>아직 작성된 리뷰가 없습니다.</p>
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
