'use client'

import { CustomerQuote } from '@/features/my-quotes/api'
import { useCompareQuotes } from '@/features/quotes-compare/hooks/useCompareQuotes'
import { isApiError } from '@/lib/api-error'
import { useState } from 'react'
import QuoteCompareResult from './QuoteCompareResult'
import QuoteCompareSelect, { Selection } from './QuoteCompareSelect'

type Props = {
  requestId: string
  pendingQuotes: CustomerQuote[]
}

export default function QuoteCompareStep({ requestId, pendingQuotes }: Props) {
  const [step, setStep] = useState<'select' | 'result'>('select')
  const [selection, setSelection] = useState<Selection | undefined>()
  // 404 발생 시 선택값 초기화를 위한 리마운트 key
  const [selectKey, setSelectKey] = useState(0)

  const { mutate, data, isPending } = useCompareQuotes(requestId)

  return step === 'result' && data ? (
    <QuoteCompareResult
      result={data}
      keywords={selection?.keywords ?? []}
      onPrevious={() => setStep('select')}
    />
  ) : (
    <QuoteCompareSelect
      key={selectKey}
      pendingQuotes={pendingQuotes}
      initialSelection={selection}
      isPending={isPending}
      onNext={(value) => {
        setSelection(value)
        mutate(value, {
          onSuccess: () => setStep('result'),
          onError: (error) => {
            if (isApiError(error) && error.status === 404) {
              setSelection(undefined)
              setSelectKey((key) => key + 1)
            }
          },
        })
      }}
    />
  )
}
