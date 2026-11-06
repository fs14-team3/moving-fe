import { FileText, Heart, Star } from 'lucide-react'
import Image from 'next/image'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/button/Button'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import type { ServiceType } from '@/constants/services'
import type { CustomerQuote } from '@/features/my-quotes/api'

type PendingQuoteCardProps = {
  quote: CustomerQuote
  // 견적을 받은 요청의 이사 유형
  moveType: ServiceType
  onConfirm: () => void
  // 다른 견적을 확정하는 중이면 함께 막는다.
  confirmDisabled?: boolean
}

// 카드 너비를 꽉 채우고, 태블릿 이상은 두 버튼을 한 줄에 나눠 둔다.
const BUTTON =
  'h-12 w-full flex-1 rounded-xl text-sm md:text-base lg:h-14 lg:w-full lg:text-base'

// 일반 유저가 받은 대기 중인 견적 카드
export default function PendingQuoteCard({
  quote,
  moveType,
  onConfirm,
  confirmDisabled = false,
}: PendingQuoteCardProps) {
  const { label, icon } = MOVE_TYPE[moveType]
  const { mover } = quote

  // 화면 표시용 데이터
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const nickname = mover.nickname?.trim() || '익명'
  const rating = mover.averageRating.toFixed(1)
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'
  const favoriteCount = mover.favoriteCount ?? '-'

  return (
    <article className="rounded-2xl bg-white px-5 py-6 shadow-sm lg:px-6 lg:py-7">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge icon={icon}>{label}</Badge>
          {quote.isDesignated && (
            <Badge icon={<FileText className="size-3.5 md:size-4" />}>
              지정 견적 요청
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-sm text-gray-500 lg:text-base">
          견적대기
        </span>
      </div>

      <h3 className="mt-3 line-clamp-1 text-base font-semibold text-black-400 lg:mt-4 lg:text-lg">
        {intro}
      </h3>

      <div className="mt-3 flex items-center gap-3 border-b border-line-100 pb-4 lg:mt-4 lg:pb-5">
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
              {mover.confirmedCount}건{' '}
              <span className="text-gray-400">확정</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between lg:mt-5">
        <span className="text-sm text-black-300 lg:text-base">견적 금액</span>
        <strong className="text-lg font-bold text-black-400 lg:text-2xl">
          {quote.price.toLocaleString('ko-KR')}원
        </strong>
      </div>

      {/* 모바일은 견적 확정하기를 위에, 태블릿 이상은 상세보기를 왼쪽에 둔다. */}
      <div className="mt-6 flex flex-col-reverse gap-2 md:flex-row md:gap-3 lg:mt-8">
        {/* TODO: 견적 상세 페이지(/my-quotes/[quoteId])를 만들면 이 주소에 연결된다. */}
        <Button
          variant="outlined"
          href={`/my-quotes/${quote.id}`}
          aria-label={`${nickname} 기사님 견적 상세보기`}
          className={BUTTON}
        >
          상세보기
        </Button>
        <Button
          onClick={onConfirm}
          disabled={confirmDisabled}
          aria-label={`${nickname} 기사님 견적 확정하기`}
          className={BUTTON}
        >
          견적 확정하기
        </Button>
      </div>
    </article>
  )
}
