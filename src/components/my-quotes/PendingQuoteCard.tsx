import Button from '@/components/common/button/Button'
import QuoteBadges from '@/components/my-quotes/QuoteBadges'
import QuoteMoverInfo from '@/components/my-quotes/QuoteMoverInfo'
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
  const { mover } = quote

  // 화면 표시용 데이터
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const nickname = mover.nickname?.trim() || '익명'

  return (
    <article className="rounded-2xl bg-white px-5 py-6 shadow-sm lg:px-6 lg:py-7">
      <div className="flex items-start justify-between gap-2">
        <QuoteBadges moveType={moveType} isDesignated={quote.isDesignated} />
        <span className="shrink-0 text-sm text-gray-500 lg:text-base">
          견적대기
        </span>
      </div>

      <h3 className="mt-3 line-clamp-1 text-base font-semibold text-black-400 lg:mt-4 lg:text-lg">
        {intro}
      </h3>

      <QuoteMoverInfo
        mover={mover}
        className="mt-3 border-b border-line-100 pb-4 lg:mt-4 lg:pb-5"
      />

      <div className="mt-4 flex items-center justify-between lg:mt-5">
        <span className="text-sm text-black-300 lg:text-base">견적 금액</span>
        <strong className="text-lg font-bold text-black-400 lg:text-2xl">
          {quote.price.toLocaleString('ko-KR')}원
        </strong>
      </div>

      {/* 모바일은 견적 확정하기를 위에, 태블릿 이상은 상세보기를 왼쪽에 둔다. */}
      <div className="mt-6 flex flex-col-reverse gap-2 md:flex-row md:gap-3 lg:mt-8">
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
