'use client'

import { useId, useState, type SubmitEvent } from 'react'
import Input from '@/components/common/input/Input'
import Modal, {
  ModalButton,
  ModalField,
  RequestSummary,
  type RequestSummaryProps,
} from './Modal'
import TextArea from '@/components/common/input/TextArea'

const COMMENT_MIN_LENGTH = 10
// 9자리(999,999,999원)까지만 받아 Number로 바꿀 때 오차가 없게 한다.
const PRICE_MAX_DIGITS = 9

type Quote = {
  price: number
  comment: string
}

type SendFormProps = {
  request: RequestSummaryProps
  onSubmit: (quote: Quote) => void
  isSubmitting?: boolean
}

type SendModalProps = SendFormProps & {
  open: boolean
  onClose: () => void
}

function toPriceDigits(value: string) {
  return value.replace(/\D/g, '').replace(/^0+/, '').slice(0, PRICE_MAX_DIGITS)
}

function formatPrice(digits: string) {
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

function SendForm({ request, onSubmit, isSubmitting = false }: SendFormProps) {
  const priceId = useId()
  const commentId = useId()
  // 콤마 없는 숫자 문자열로 들고 있다가, 보여줄 때만 콤마를 붙인다.
  const [price, setPrice] = useState('')
  const [comment, setComment] = useState('')

  const trimmedComment = comment.trim()
  const canSubmit =
    price !== '' && trimmedComment.length >= COMMENT_MIN_LENGTH && !isSubmitting

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ price: Number(price), comment: trimmedComment })
  }

  return (
    <>
      <RequestSummary {...request} />
      <form onSubmit={handleSubmit}>
        <ModalField label="견적가를 입력해 주세요" htmlFor={priceId}>
          <Input
            id={priceId}
            inputMode="numeric"
            placeholder="견적가 입력"
            value={formatPrice(price)}
            onChange={(e) => setPrice(toPriceDigits(e.target.value))}
            wrapperClassName="w-full lg:w-full"
          />
        </ModalField>
        <ModalField label="코멘트를 입력해 주세요" htmlFor={commentId}>
          <TextArea
            id={commentId}
            placeholder={`최소 ${COMMENT_MIN_LENGTH}자 이상 입력해주세요`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            wrapperClassName="w-full lg:w-full"
          />
        </ModalField>
        <ModalButton type="submit" disabled={!canSubmit}>
          견적 보내기
        </ModalButton>
      </form>
    </>
  )
}

export default function SendModal({
  open,
  onClose,
  ...formProps
}: SendModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="견적 보내기">
      <SendForm {...formProps} />
    </Modal>
  )
}
