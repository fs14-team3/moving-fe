import { Star } from 'lucide-react'

type RatingStarsProps = {
  rating: number
  isDecorative?: boolean
}

const STARS_COUNT = 5

export default function RatingStars({
  rating,
  isDecorative = false,
}: RatingStarsProps) {
  // TODO: 리뷰 평점 입력 단위(정수 또는 0.5) 확정 후 표시 기준 확인
  // 평점을 가장 가까운 0.5 단위로 반올림해 반쪽 별까지 표시
  const normalizedRating = Math.round(rating * 2) / 2
  const fullCount = Math.floor(normalizedRating)
  const hasHalf = normalizedRating % 1 !== 0

  return (
    <div
      className="flex"
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : `평점 5점 만점에 ${rating}점`}
      aria-hidden={isDecorative || undefined}
    >
      {Array.from({ length: STARS_COUNT }, (_, index) => {
        if (index < fullCount) {
          return (
            <Star
              key={index}
              className="m-[3px] size-5 fill-yellow-400 text-yellow-400"
            />
          )
        }

        if (fullCount === index && hasHalf) {
          return (
            <span key={index} className="relative m-[3px] inline-block size-5">
              <Star className="absolute size-5 fill-gray-200 text-gray-200" />
              <span className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
              </span>
            </span>
          )
        }

        return (
          <Star
            key={index}
            className="m-[3px] size-5 fill-gray-200 text-gray-200"
          />
        )
      })}
    </div>
  )
}
