import Image from 'next/image'
import Button from '@/components/common/button/Button'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import type { ReviewTarget } from '@/features/reviews/api'
import {
  formatMoveDate,
  toShortAddress,
} from '@/features/received-requests/format'
import { cn } from '@/lib/cn'

type WritableReviewCardProps = {
  target: ReviewTarget
  onWrite: () => void
}

// 모바일은 출발지 · 도착지를 한 줄에, 이사일을 그 아래 줄에 둔다.
// 태블릿 이상은 세 항목을 세로선으로 나눠 한 줄에 둔다.
function InfoItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 md:border-l md:border-line-200 md:px-4 md:first:border-l-0 md:first:pl-0',
        className,
      )}
    >
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-black-400">{value}</dd>
    </div>
  )
}

// 리뷰를 쓸 수 있는 확정 견적 카드
// 데스크톱은 왼쪽에 기사님 · 이사 정보, 오른쪽에 견적 금액 · 리뷰 작성하기를 둔다.
export default function WritableReviewCard({
  target,
  onWrite,
}: WritableReviewCardProps) {
  const { mover } = target
  const nickname = mover.nickname?.trim() || '익명'
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const from = target.from ? toShortAddress(target.from.address) : '-'
  const to = target.to ? toShortAddress(target.to.address) : '-'

  return (
    <article className="grid grid-cols-1 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-6 md:p-6 lg:px-8 lg:py-7">
      {/* 모바일은 배지를 맨 위, 프로필 사진을 오른쪽에 둔다. 태블릿 이상은 사진을 왼쪽에 둔다. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:col-span-2 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-4 md:gap-y-2 lg:col-span-1">
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-2">
          <QuoteBadges
            moveType={target.moveType}
            isDesignated={target.isDesignated}
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
          <p className="mt-1 line-clamp-1 text-xs text-gray-500 md:text-sm">
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

      <dl className="mt-4 grid grid-cols-2 gap-3 md:col-start-1 md:row-start-2 md:flex md:gap-0 lg:mt-5">
        <InfoItem label="출발지" value={from} />
        <InfoItem label="도착지" value={to} />
        <InfoItem
          label="이사일"
          value={formatMoveDate(target.moveDate)}
          className="col-span-2"
        />
      </dl>

      {/* 모바일은 구분선 아래 한 줄, 태블릿은 이사 정보 오른쪽, 데스크톱은 카드 오른쪽 위에 둔다. */}
      <div className="mt-4 flex items-center justify-between border-t border-line-100 pt-4 md:col-start-2 md:row-start-2 md:flex-col md:items-end md:justify-end md:border-t-0 md:pt-0 lg:row-start-1 lg:mt-0 lg:self-end">
        <span className="text-xs text-gray-500 lg:text-sm">견적 금액</span>
        <strong className="text-lg font-bold text-black-400 lg:text-2xl">
          {target.price.toLocaleString('ko-KR')}원
        </strong>
      </div>

      <Button
        onClick={onWrite}
        aria-label={`${nickname} 기사님 리뷰 작성하기`}
        className="mt-5 h-12 w-full rounded-xl text-sm md:col-span-2 md:row-start-3 md:text-base lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:mt-4 lg:h-12 lg:w-auto lg:px-8 lg:text-base"
      >
        리뷰 작성하기
      </Button>
    </article>
  )
}
