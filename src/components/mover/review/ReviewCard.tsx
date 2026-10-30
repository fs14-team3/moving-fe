import type { Review } from '@/features/movers/types'
import RatingStars from './RatingStars'

type ReviewCardProps = {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const customerName = review.customerName?.trim() || '익명'
  const createdAt = review.createdAt.split('T')[0]

  return (
    <article className="flex flex-col gap-4 border-b border-line-200 py-5 md:gap-6 md:py-6">
      <header>
        <div className="flex items-center pb-2 text-sm leading-6 font-normal md:text-lg">
          <span>{customerName}</span>
          <span
            aria-hidden="true"
            className="mx-3 h-3 w-px bg-line-200 md:mx-[14px] md:h-[14px]"
          />
          <time dateTime={review.createdAt} className="text-gray-400">
            {createdAt}
          </time>
        </div>
        <RatingStars rating={review.rating} />
      </header>

      <p className="text-sm leading-6 font-normal md:text-lg">
        {review.content}
      </p>
    </article>
  )
}
