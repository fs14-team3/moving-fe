'use client'

import { CustomerQuote } from '@/features/my-quotes/api'
import { useState } from 'react'
import QuoteCompareResult from './QuoteCompareResult'
import QuoteCompareSelect, { Selection } from './QuoteCompareSelect'

type Props = {
  pendingQuotes: CustomerQuote[]
}

export default function QuoteCompareStep({ pendingQuotes }: Props) {
  const [step, setStep] = useState<'select' | 'result'>('select')
  const [selection, setSelection] = useState<Selection | undefined>()

  return step === 'select' ? (
    <QuoteCompareSelect
      pendingQuotes={pendingQuotes}
      initialSelection={selection}
      onNext={(value) => {
        // TODO: 제출 시, 비교 api 호출 후 결과 화면으로 이동
        setSelection(value)
        setStep('result')
      }}
    />
  ) : (
    <QuoteCompareResult onPrevious={() => setStep('select')} />
  )
}
