import Image from 'next/image'
import RatingStars from '@/components/mover/review/RatingStars'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import type { MyReview } from '@/features/reviews/api'
import { formatReviewDate } from '@/features/reviews/format'
import {
  formatMoveDate,
  toShortAddress,
} from '@/features/received-requests/format'

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-l border-line-200 px-3 first:border-l-0 first:pl-0 md:px-4 md:first:pl-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-xs font-semibold text-black-400 md:text-sm">
        {value}
      </dd>
    </div>
  )
}

// 내가 쓴 리뷰 카드
// 모바일은 배지를 맨 위, 프로필 사진을 오른쪽에 두고 작성일을 카드 아래에 둔다.
// 태블릿 이상은 사진을 왼쪽에 두고 기사님 소개를 같이 보여준다.
export default function MyReviewCard({ review }: { review: MyReview }) {
  const { mover } = review
  const nickname = mover.nickname?.trim() || '익명'
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const from = review.from ? toShortAddress(review.from.address) : '-'
  const to = review.to ? toShortAddress(review.to.address) : '-'

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm md:p-6 lg:px-8 lg:py-7">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-4 md:gap-y-2">
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-2">
          <QuoteBadges
            moveType={review.moveType}
            isDesignated={review.isDesignated}
          />
        </div>
        <div className="min-w-0 md:col-start-2 md:row-start-1">
          <p className="flex items-center gap-1 text-base font-semibold text-black-400">
            <Image
              src="/assets/icons/mover_badge.png"
              width={20}
              height={20}
              alt=""
            />
            {nickname} 기사님
          </p>
          <p className="mt-1 line-clamp-1 hidden text-sm text-gray-500 md:block">
            {intro}
          </p>
        </div>
        <Image
          src={mover.imageUrl ?? '/assets/images/profile.png'}
          width={80}
          height={80}
          alt=""
          className="size-12 rounded-xl object-cover md:col-start-1 md:row-span-2 md:row-start-1 md:size-20"
        />
      </div>

      <dl className="mt-4 flex border-b border-line-100 pb-4 md:border-b-0 md:pb-0 lg:mt-5">
        <InfoItem label="출발지" value={from} />
        <InfoItem label="도착지" value={to} />
        <InfoItem label="이사일" value={formatMoveDate(review.moveDate)} />
      </dl>

      <div className="mt-4 flex flex-col gap-2 lg:mt-5">
        <RatingStars rating={review.rating} />
        <p className="text-sm leading-6 font-semibold whitespace-pre-line text-black-400 md:text-base">
          {review.content}
        </p>
      </div>

      <p className="mt-4 text-right text-xs text-gray-400 md:hidden">
        작성일{' '}
        <time dateTime={review.createdAt}>
          {formatReviewDate(review.createdAt)}
        </time>
      </p>
    </article>
  )
}
