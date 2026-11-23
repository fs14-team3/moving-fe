'use client'

import { MOCK_QUOTE_COMPARISON } from '@/features/my-quotes/fixtures/quotes'
import { cn } from '@/lib/cn'
import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import Button from '../common/button/Button'

// TODO: api 타입 교체
type Quote = (typeof MOCK_QUOTE_COMPARISON.quotes)[number]

type Row = {
  label: string
  isLong?: boolean
  value: (quote: Quote) => string
}

const ASPECT_ROWS = [
  { label: '시간 약속', key: 'PUNCTUALITY' },
  { label: '짐 취급', key: 'HANDLING' },
  { label: '빠른 작업', key: 'SPEED' },
  { label: '소통', key: 'COMMUNICATION' },
]

const EMPTY_VALUE = ['-', '후기 부족', '언급 없음']

// TODO: 선택 화면과 같은 키워드 상수로 합치기
const KEYWORD_LABELS: Record<string, string> = {
  PRICE: '가격',
  CAREER: '경력',
  PUNCTUALITY: '시간 약속',
  HANDLING: '짐 취급',
  SPEED: '빠른 작업',
  COMMUNICATION: '소통',
}

export default function QuoteCompareResult() {
  const [isExpanded, setIsExpanded] = useState(false)

  // TODO: api 데이터 변경
  const quotes = MOCK_QUOTE_COMPARISON.quotes
  const recommendedId = MOCK_QUOTE_COMPARISON.recommendation.quoteId
  const selectedKeywords = MOCK_QUOTE_COMPARISON.selectedKeywords

  const rows: Row[] = [
    {
      label: '금액',
      value: (quote) => `${quote.price.toLocaleString()}원`,
    },
    {
      label: '경력',
      value: (quote) => `${quote.mover.careerYears}년`,
    },
    {
      label: '평점',
      value: (quote) =>
        quote.mover.reviewCount > 0 ? `${quote.mover.averageRating}` : '-',
    },
    {
      label: '리뷰 개수',
      value: (quote) => `${quote.mover.reviewCount}개`,
    },
    ...ASPECT_ROWS.map(({ label, key }): Row => ({
      label,
      value: (quote) => {
        if (!quote.mover.aspects) return '후기 부족'

        const aspect = quote.mover.aspects.find((item) => item.key === key)
        if (!aspect) return '언급 없음'

        return `긍정 ${aspect.positiveCount} · 부정 ${aspect.negativeCount}`
      },
    })),
    {
      label: '리뷰 요약',
      isLong: true,
      value: (quote) => quote.mover.reviewSummary ?? '-',
    },
    {
      label: '견적 메시지',
      isLong: true,
      value: (quote) => quote.comment ?? '-',
    },
  ]

  const recommendQuote = MOCK_QUOTE_COMPARISON.quotes.find((quote) =>
    recommendedId.includes(quote.id),
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="rounded-xl bg-primary-100/60 p-4 shadow-sm md:p-5 lg:p-6">
        <p className="text-base md:text-lg">
          <span className="font-semibold">
            {recommendQuote?.mover.nickname}{' '}
          </span>
          기사님을 추천해요!
        </p>
        <p className="mt-1 text-xs text-gray-500 md:text-sm lg:text-base">
          {MOCK_QUOTE_COMPARISON.recommendation.reason}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="leading-6 font-semibold md:text-lg">비교 결과</h3>
        <p className="text-xs text-gray-500 md:text-sm">
          선택한 키워드를 기준으로 비교했어요.
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedKeywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-2xl border border-primary-400 bg-primary-100 px-[10px] py-[6px] text-xs font-medium text-primary-400 md:text-sm"
            >
              {KEYWORD_LABELS[keyword] ?? keyword}
            </span>
          ))}
        </div>
      </div>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-line-200">
            <th
              scope="col"
              className="w-14 px-2 py-2 text-left align-bottom text-xs font-medium text-gray-500 md:w-20 md:px-3 md:py-3 md:text-sm lg:text-base"
            >
              기사님
            </th>
            {quotes.map((quote) => {
              const isRecommended = recommendedId.includes(quote.id)

              return (
                <th
                  key={quote.id}
                  className={cn(
                    'px-2 py-2 text-center align-bottom text-xs font-semibold break-keep md:px-3 md:py-3 md:text-sm lg:text-base',
                    isRecommended && 'bg-primary-100/40',
                  )}
                >
                  {isRecommended && (
                    <BadgeCheck
                      aria-label="추천"
                      className="mx-auto mb-1 size-4 text-primary-400 lg:size-5"
                    />
                  )}
                  {quote.mover.nickname}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-line-100 last:border-b-0"
            >
              <th
                scope="row"
                className="w-14 px-2 py-2 text-left text-xs font-medium break-keep text-gray-500 md:w-20 md:px-3 md:py-3 md:text-sm lg:text-base"
              >
                {row.label}
              </th>
              {quotes.map((quote) => {
                const value = row.value(quote)
                const isEmpty = EMPTY_VALUE.includes(value)
                const isRecommended = recommendedId.includes(quote.id)

                return (
                  <td
                    key={quote.id}
                    className={cn(
                      'px-2 py-2 text-xs md:px-3 md:py-3 md:text-sm lg:text-base',
                      row.isLong && !isEmpty
                        ? 'text-left align-top'
                        : 'text-center align-middle',
                      isEmpty && 'text-gray-400',
                      isRecommended && 'bg-primary-100/40',
                    )}
                  >
                    <div
                      className={
                        row.isLong && !isExpanded ? 'line-clamp-4' : ''
                      }
                    >
                      {value}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="self-center text-xs text-black-200 hover:cursor-pointer hover:text-gray-500 hover:underline md:text-sm lg:text-base"
      >
        {isExpanded ? '접기' : '리뷰 요약·견적 메시지 더보기'}
      </button>

      <Button
        variant="outlined"
        className="w-full hover:cursor-pointer md:h-15 lg:w-full lg:text-base"
      >
        다시 선택하기
      </Button>
    </div>
  )
}
