'use client'

import { COMPARISON_KEYWORD_LABELS } from '@/constants/quotesCompare'
import { CustomerQuote } from '@/features/my-quotes/api'
import type { ComparisonKeyword } from '@/features/quotes-compare/types'
import { ChevronDown, XIcon } from 'lucide-react'
import { useState } from 'react'
import SelectChip from '../common/SelectChip'
import Button from '../common/button/Button'

export type Selection = { quoteIds: string[]; keywords: ComparisonKeyword[] }

type Props = {
  pendingQuotes: CustomerQuote[]
  initialSelection?: Selection
  isPending: boolean
  onNext: (value: Selection) => void
}

const KEYWORDS = Object.keys(COMPARISON_KEYWORD_LABELS) as ComparisonKeyword[]

export default function QuoteCompareSelect({
  pendingQuotes,
  initialSelection,
  isPending,
  onNext,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedQuotes, setSelectedQoutes] = useState<string[]>(
    initialSelection?.quoteIds ?? [],
  )
  const [selectedKeywords, setSelectedKeywords] = useState<ComparisonKeyword[]>(
    initialSelection?.keywords ?? [],
  )

  // 견적 선택 핸들러
  function handleQuoteSelect(quoteId: string) {
    if (selectedQuotes.includes(quoteId)) {
      setSelectedQoutes(
        selectedQuotes.filter((selectedId) => selectedId !== quoteId),
      )
    } else if (selectedQuotes.length < 3) {
      setSelectedQoutes([...selectedQuotes, quoteId])
    }
  }

  // 키워드 선택 핸들러
  function handleKeywordSelect(keyword: ComparisonKeyword) {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(
        selectedKeywords.filter(
          (selectedKeyword) => selectedKeyword !== keyword,
        ),
      )
    } else if (selectedKeywords.length < 3) {
      setSelectedKeywords([...selectedKeywords, keyword])
    }
  }

  // 폼 제출
  const isFormComplete =
    selectedQuotes.length >= 2 && selectedKeywords.length >= 1

  return (
    <form
      className="flex flex-col gap-10 md:gap-12"
      onSubmit={(event) => {
        event.preventDefault()
        onNext({ quoteIds: selectedQuotes, keywords: selectedKeywords })
      }}
    >
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-1 leading-6 font-semibold md:text-lg">
          비교할 견적을 선택해주세요
          <span className="text-xs font-normal text-gray-500 md:text-sm">
            (최대 3개)
          </span>
        </h3>
        <div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex w-full items-center justify-between rounded-xl border border-line-100 px-5 py-2 text-sm leading-6 font-medium hover:cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed md:text-base ${isDropdownOpen ? 'border-primary-400 bg-primary-100 text-primary-400 hover:bg-primary-100' : 'border-line-100'}`}
          >
            견적 선택
            <ChevronDown
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isDropdownOpen && (
            <ul className="mt-2 flex h-54 w-full flex-col overflow-auto rounded-xl border border-line-100 bg-white shadow-sm">
              {pendingQuotes.map((pendingQuote) => {
                const nickname = pendingQuote.mover.nickname?.trim() ?? '익명'

                return (
                  <li key={pendingQuote.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuoteSelect(pendingQuote.id)}
                      className="flex w-full items-center justify-center gap-1 border-b border-line-100 px-5 py-4 text-sm leading-6 font-medium hover:cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed md:text-base"
                    >
                      {nickname} 기사님
                      <span className="text-xs font-normal md:text-sm">
                        ({pendingQuote.price.toLocaleString()}원)
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex flex-wrap gap-2 pt-3">
            {selectedQuotes.map((quoteId) => {
              const quote = pendingQuotes.find(
                (pendingQuote) => pendingQuote.id === quoteId,
              )
              if (!quote) return null

              const nickname = quote.mover.nickname?.trim() ?? '익명'

              return (
                <div
                  key={quoteId}
                  className="flex items-center gap-[5px] rounded-2xl border border-primary-400 bg-primary-100 px-[10px] py-[6px] font-medium text-primary-400"
                >
                  <p className="text-xs md:text-sm">{nickname} 기사님</p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuoteSelect(quoteId)}
                    className="hover:cursor-pointer disabled:cursor-not-allowed"
                  >
                    <XIcon
                      aria-label={`${nickname} 기사님 선택 해제`}
                      className="size-4 rounded-full bg-white p-[2px] text-black hover:cursor-pointer"
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-1 leading-6 font-semibold md:text-lg">
          키워드를 선택해주세요
          <span className="text-xs font-normal text-gray-500 md:text-sm">
            (최대 3개)
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {KEYWORDS.map((keyword) => (
            <SelectChip
              key={keyword}
              selected={selectedKeywords.includes(keyword)}
              disabled={isPending}
              onClick={() => handleKeywordSelect(keyword)}
              className="hover:cursor-pointer disabled:cursor-not-allowed"
            >
              {COMPARISON_KEYWORD_LABELS[keyword]}
            </SelectChip>
          ))}
        </div>
      </section>

      <Button
        type="submit"
        disabled={!isFormComplete || isPending}
        className="w-full hover:cursor-pointer disabled:cursor-not-allowed md:h-15 lg:w-full lg:text-base"
      >
        {isPending ? '견적 비교 중...' : '견적 비교하기'}
      </Button>
    </form>
  )
}
