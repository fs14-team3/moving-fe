'use client'

import Button from '@/components/common/button/Button'
import Modal from '@/components/common/modal/Modal'
import { REVIEW_ASPECT_OPTIONS } from '@/constants/review'
import { useMoverReviewSummary } from '@/features/movers/hooks/useMoverReviewSummary'
import { Info, LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'

type ReviewSummaryProps = {
  moverId: string
}

export default function ReviewSummary({ moverId }: ReviewSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { reviewSummary, isPending, isError, refetch, isRefetching } =
    useMoverReviewSummary(moverId)

  if (isPending) {
    return (
      <div
        role="status"
        className="mt-8 mb-8 flex min-h-60 flex-col items-center justify-center gap-4 lg:mt-0 lg:mb-10"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-primary-400"
        />
        <p className="text-base text-gray-400 md:text-lg">
          리뷰 요약을 불러오고 있습니다.
        </p>
      </div>
    )
  }

  if (isError && !reviewSummary) {
    return (
      <div className="mt-8 mb-8 flex min-h-60 flex-col items-center justify-center gap-4 lg:mt-0 lg:mb-10">
        <p role="alert" className="text-base text-gray-400 md:text-lg">
          리뷰 요약을 불러오지 못했습니다.
        </p>
        <Button
          variant="outlined"
          disabled={isRefetching}
          onClick={() => refetch()}
          className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto"
        >
          다시 시도
        </Button>
      </div>
    )
  }

  if (!reviewSummary) return null

  const aspects = REVIEW_ASPECT_OPTIONS.map(({ value, label }) => {
    const counts = reviewSummary.aspects.find((aspect) => aspect.key === value)

    return {
      key: value,
      label,
      positiveCount: counts?.positiveCount ?? 0,
      negativeCount: counts?.negativeCount ?? 0,
    }
  })

  return (
    <div className="mt-8 mb-8 flex flex-col gap-4 rounded-[20px] p-5 shadow-[2px_2px_10px_0px_rgba(220,220,220,0.20),_-2px_-2px_10px_0px_rgba(220,220,220,0.20)] md:gap-6 md:p-8 lg:mt-0 lg:mb-10">
      <header className="flex items-center justify-between">
        <h2 className="flex items-center gap-[6px] text-base leading-6 font-semibold md:text-lg">
          <Sparkles className="size-4 fill-blue-500 text-blue-500" />
          리뷰 요약{' '}
          <span className="text-sm font-normal text-gray-500">
            ({reviewSummary.reviewCount}건 기준)
          </span>
        </h2>
        <button
          type="button"
          aria-label="AI 요약 안내"
          onClick={() => setIsOpen(true)}
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-500"
        >
          AI <Info aria-hidden="true" className="size-4 text-gray-400" />
        </button>
      </header>

      <p className="text-base leading-6 font-normal text-black-300 md:text-lg md:leading-8">
        {reviewSummary.summary}
      </p>

      <div className="h-px bg-line-100" />

      {/* 모바일 버전 */}
      <div className="mx-auto flex w-full max-w-64 flex-col gap-2 text-sm leading-6 md:hidden">
        <div className="flex justify-end gap-4 text-gray-500">
          <span className="w-12 text-right">긍정</span>
          <span className="w-12 text-right">부정</span>
        </div>

        {aspects.map((aspect) => (
          <div key={aspect.key} className="flex items-baseline">
            <span className="font-normal text-gray-500">
              {
                REVIEW_ASPECT_OPTIONS.find(
                  (option) => option.value === aspect.key,
                )?.label
              }
            </span>
            <span className="ml-auto flex gap-4">
              <span className="w-12 text-right font-semibold">
                <span className="tabular-nums">{aspect.positiveCount}</span>건
              </span>
              <span className="w-12 text-right font-semibold">
                <span className="tabular-nums">{aspect.negativeCount}</span>건
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* 데스크탑·태블릿 버전 */}
      <div className="hidden text-center text-sm leading-6 md:mx-auto md:grid md:w-full md:max-w-xl md:grid-cols-[max-content_repeat(5,minmax(0,1fr))] md:gap-x-4 md:gap-y-2">
        <span />
        {aspects.map((aspect) => (
          <span key={aspect.key} className="font-normal text-gray-500">
            {
              REVIEW_ASPECT_OPTIONS.find(
                (option) => option.value === aspect.key,
              )?.label
            }
          </span>
        ))}

        <span className="text-left font-normal text-gray-500">긍정</span>
        {aspects.map((aspect) => (
          <span key={`${aspect.key}-positive`} className="font-semibold">
            <span className="tabular-nums">{aspect.positiveCount}</span>건
          </span>
        ))}

        <span className="text-left font-normal text-gray-500">부정</span>
        {aspects.map((aspect) => (
          <span key={`${aspect.key}-negative`} className="font-semibold">
            <span className="tabular-nums">{aspect.negativeCount}</span>건
          </span>
        ))}
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="AI 생성 콘텐츠"
      >
        <h3 className="text-base font-semibold">어떤 리뷰를 요약하나요?</h3>
        <p className="mt-2 text-sm text-black-200 md:text-base">
          기사님에게 리뷰가 10건 이상 쌓이면, AI가 여러 후기에서 반복된 경험을
          정리해요. 칭찬과 아쉬움이 모두 반복되면 함께 담아요.
        </p>
        <h3 className="mt-6 text-base font-semibold">
          긍정·부정은 어떻게 세나요?
        </h3>
        <p className="mt-2 text-sm text-black-200 md:text-base">
          리뷰 본문을 보고 항목별로 판단해요. 예를 들어 “포장은 꼼꼼했지만 추가
          비용은 아쉬웠어요”는 짐 취급 긍정 1건, 가격 부정 1건으로 세어요.
          평가가 분명하지 않은 항목은 긍정·부정 건수에서 제외해요.
        </p>
        <p className="mt-6 text-sm text-black-200 md:text-base">
          AI가 리뷰의 맥락을 다르게 해석할 수 있어요. 자세한 이용 경험은 아래
          리뷰에서 확인해주세요.
        </p>
      </Modal>
    </div>
  )
}
