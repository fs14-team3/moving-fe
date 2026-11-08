import { Heart, Star } from 'lucide-react'
import Image from 'next/image'
import type { CustomerQuote } from '@/features/my-quotes/api'
import { cn } from '@/lib/cn'

type QuoteMoverInfoProps = {
  mover: CustomerQuote['mover']
  className?: string
  // 기사님 표시 아이콘. 화면 크기별로 숨길 때 쓴다.
  badgeClassName?: string
}

// 견적 카드 안의 기사님 정보 한 줄. 찜은 상태만 보여준다.
export default function QuoteMoverInfo({
  mover,
  className,
  badgeClassName,
}: QuoteMoverInfoProps) {
  const nickname = mover.nickname?.trim() || '익명'
  const rating = mover.averageRating.toFixed(1)
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'
  const favoriteCount = mover.favoriteCount ?? '-'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src={mover.imageUrl ?? '/assets/images/profile.png'}
        width={50}
        height={50}
        alt=""
        className="size-12.5 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-sm leading-6 font-semibold">
            <Image
              src="/assets/icons/mover_badge.png"
              width={20}
              height={20}
              alt=""
              className={badgeClassName}
            />
            {nickname} 기사님
          </p>
          <p className="flex shrink-0 items-center gap-1 text-sm text-gray-500">
            <Heart
              aria-hidden="true"
              className={
                mover.isFavorite
                  ? 'size-4 fill-red-500 text-red-500'
                  : 'size-4 fill-transparent text-gray-300'
              }
            />
            <span className="sr-only">찜</span>
            {favoriteCount}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star
              aria-hidden="true"
              className="size-3.5 fill-yellow-400 text-yellow-400"
            />
            <p className="text-xs leading-5 font-medium">{rating}</p>
            <p className="text-xs leading-5 font-medium text-gray-400">
              ({mover.reviewCount})
            </p>
          </div>
          <p className="relative px-1.5 text-xs leading-5 font-medium before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-line-200 after:absolute after:inset-y-1 after:right-0 after:w-px after:bg-line-200">
            <span className="text-gray-400">경력</span> {careerYears}
          </p>
          <p className="text-xs leading-5 font-medium">
            {mover.confirmedCount}건 <span className="text-gray-400">확정</span>
          </p>
        </div>
      </div>
    </div>
  )
}
