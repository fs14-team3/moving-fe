'use client'

import { useId, useState, type SubmitEvent } from 'react'
import Modal, {
  ModalButton,
  ModalField,
  RequestSummary,
  type RequestSummaryProps,
} from './Modal'
import TextArea from '@/components/common/input/TextArea'

const REASON_MIN_LENGTH = 10

type RejectFormProps = {
  request: RequestSummaryProps
  onSubmit: (reason: string) => void
  isSubmitting?: boolean
}

type RejectModalProps = RejectFormProps & {
  open: boolean
  onClose: () => void
}

function RejectForm({
  request,
  onSubmit,
  isSubmitting = false,
}: RejectFormProps) {
  const reasonId = useId()
  const [reason, setReason] = useState('')

  const trimmedReason = reason.trim()
  const canSubmit = trimmedReason.length >= REASON_MIN_LENGTH && !isSubmitting

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(trimmedReason)
  }

  return (
    <>
      <RequestSummary {...request} />
      <form onSubmit={handleSubmit}>
        <ModalField label="반려 사유를 입력해 주세요" htmlFor={reasonId}>
          <TextArea
            id={reasonId}
            placeholder={`최소 ${REASON_MIN_LENGTH}자 이상 입력해주세요`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            wrapperClassName="w-full lg:w-full"
          />
        </ModalField>
        <ModalButton type="submit" disabled={!canSubmit}>
          반려하기
        </ModalButton>
      </form>
    </>
  )
}

export default function RejectModal({
  open,
  onClose,
  ...formProps
}: RejectModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="반려요청">
      <RejectForm {...formProps} />
    </Modal>
  )
}
