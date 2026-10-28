type RatingCount = {
  rating: number
  count: number
}

type RatingDistributionProps = {
  ratingCounts: RatingCount[]
}

const RATING_VALUES = [5, 4, 3, 2, 1] as const

export default function RatingDistribution({
  ratingCounts,
}: RatingDistributionProps) {
  const totalCount = ratingCounts.reduce((total, item) => total + item.count, 0)

  return (
    <ul aria-label="평점별 리뷰 분포">
      {RATING_VALUES.map((rating) => {
        const count =
          ratingCounts.find((item) => item.rating === rating)?.count ?? 0
        const percent = totalCount > 0 ? (count / totalCount) * 100 : 0

        return (
          <li key={rating} className="flex items-center gap-4">
            <span className="w-9">{rating}점</span>

            <div
              role="progressbar"
              aria-label={`${rating}점 리뷰 비율`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
              aria-valuetext={`${count}개`}
              className="h-2 w-45 overflow-hidden rounded-2xl bg-background-300"
            >
              <div
                aria-hidden="true"
                className="h-full rounded-full bg-yellow-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <span>{count}</span>
          </li>
        )
      })}
    </ul>
  )
}
