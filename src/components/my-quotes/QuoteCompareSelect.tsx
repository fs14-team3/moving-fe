'use client'

import { CustomerQuote } from '@/features/my-quotes/api'
import { ChevronDown, XIcon } from 'lucide-react'
import { useState } from 'react'
import SelectChip from '../common/SelectChip'
import Button from '../common/button/Button'

type Props = {
  pendingQuotes: CustomerQuote[]
}

// TODO: API 타입으로 교체
const KEYWORDS = ['가격', '경력', '시간 약속', '짐 취급', '빠른 작업', '소통']

export default function QuoteCompareSelect({ pendingQuotes }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedQuotes, setSelectedQoutes] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

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
  function handleKeywordSelect(keyword: string) {
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
      className="flex flex-col gap-10"
      onSubmit={(event) => {
        // TODO: 폼 제출 연결하기
        event.preventDefault()
      }}
    >
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-1 leading-6 font-semibold">
          비교할 견적을 선택해주세요
          <span className="text-xs font-normal text-gray-500">(최대 3개)</span>
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex w-full items-center justify-between rounded-xl border border-line-100 px-5 py-2 text-sm leading-6 font-medium hover:cursor-pointer hover:bg-gray-100 ${isDropdownOpen ? 'border-primary-400 bg-primary-100 text-primary-400 hover:bg-primary-100' : 'border-line-100'}`}
          >
            견적 선택
            <ChevronDown
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isDropdownOpen && (
            <ul className="absolute top-13 flex h-54 w-full flex-col overflow-auto rounded-xl border border-line-100 bg-white shadow-sm">
              {pendingQuotes.map((pendingQuote) => {
                const nickname = pendingQuote.mover.nickname?.trim() ?? '익명'

                return (
                  <li key={pendingQuote.id}>
                    <button
                      type="button"
                      onClick={() => handleQuoteSelect(pendingQuote.id)}
                      className="flex w-full items-center justify-center gap-1 border-b border-line-100 px-5 py-4 text-sm leading-6 font-medium hover:cursor-pointer hover:bg-gray-100"
                    >
                      {nickname} 기사님
                      <span className="text-xs font-normal">
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
                  <p className="text-xs">{nickname} 기사님</p>
                  <button
                    type="button"
                    onClick={() => handleQuoteSelect(quoteId)}
                    className="hover:cursor-pointer"
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
        <h3 className="flex items-center gap-1 leading-6 font-semibold">
          키워드를 선택해주세요
          <span className="text-xs font-normal text-gray-500">(최대 3개)</span>
        </h3>
        {KEYWORDS.map((keyword) => (
          <SelectChip
            key={keyword}
            selected={selectedKeywords.includes(keyword)}
            onClick={() => handleKeywordSelect(keyword)}
            className="hover:cursor-pointer"
          >
            {keyword}
          </SelectChip>
        ))}
      </section>

      <Button
        type="submit"
        disabled={!isFormComplete}
        className="w-full hover:cursor-pointer disabled:cursor-not-allowed"
      >
        견적 비교하기
      </Button>
    </form>
  )
}
