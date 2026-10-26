'use client'

import { Star } from 'lucide-react'
import { useId, useState, type SubmitEvent } from 'react'
import Modal, {
  ModalButton,
  ModalField,
  RequestSummary,
  type RequestSummaryProps,
} from './Modal'
import TextArea from '@/components/common/input/TextArea'
import { cn } from '@/lib/cn'

const CONTENT_MIN_LENGTH = 10
const SCORES = [1, 2, 3, 4, 5]

type Review = {
  rating: number
  content: string
}

type StarRatingProps = {
  // 0이면 아직 고르지 않은 상태
  value: number
  onChange: (value: number) => void
  labelId: string
}

type ReviewFormProps = {
  // 리뷰 대상 기사님 정보. moverProfileImage까지 넘겨야 기사님 형태로 보인다.
  request: RequestSummaryProps
  onSubmit: (review: Review) => void
  isSubmitting?: boolean
}

type ReviewModalProps = ReviewFormProps & {
  open: boolean
  onClose: () => void
}

// 화면에는 별만 보이고, 실제로는 라디오 버튼이라 키보드 방향키로도 고를 수 있다.
function StarRating({ value, onChange, labelId }: StarRatingProps) {
  const name = useId()

  return (
    <div role="radiogroup" aria-labelledby={labelId} className="flex md:gap-1">
      {SCORES.map((score) => (
        <label
          key={score}
          className="cursor-pointer rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-primary-400"
        >
          <input
            type="radio"
            name={name}
            value={score}
            checked={value === score}
            onChange={() => onChange(score)}
            className="sr-only"
          />
          <Star
            aria-hidden="true"
            className={cn(
              'size-6 md:size-8',
              score <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200',
            )}
          />
          <span className="sr-only">{score}점</span>
        </label>
      ))}
    </div>
  )
}

function ReviewForm({
  request,
  onSubmit,
  isSubmitting = false,
}: ReviewFormProps) {
  const ratingLabelId = useId()
  const contentId = useId()
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')

  const trimmedContent = content.trim()
  const canSubmit =
    rating > 0 && trimmedContent.length >= CONTENT_MIN_LENGTH && !isSubmitting

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ rating, content: trimmedContent })
  }

  return (
    <>
      <RequestSummary {...request} />
      <form onSubmit={handleSubmit}>
        <ModalField label="평점을 선택해 주세요" labelId={ratingLabelId}>
          <StarRating
            value={rating}
            onChange={setRating}
            labelId={ratingLabelId}
          />
        </ModalField>
        <ModalField label="상세 후기를 작성해 주세요" htmlFor={contentId}>
          <TextArea
            id={contentId}
            placeholder={`최소 ${CONTENT_MIN_LENGTH}자 이상 입력해주세요`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            wrapperClassName="w-full lg:w-full"
          />
        </ModalField>
        <ModalButton type="submit" disabled={!canSubmit}>
          리뷰 등록
        </ModalButton>
      </form>
    </>
  )
}

export default function ReviewModal({
  open,
  onClose,
  ...formProps
}: ReviewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="리뷰 쓰기">
      <ReviewForm {...formProps} />
    </Modal>
  )
}
