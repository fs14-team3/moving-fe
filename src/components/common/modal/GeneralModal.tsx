'use client'

import Modal, { ModalButton } from './Modal'

// TODO: 일반 견적 요청 페이지 경로가 정해지면 맞춰서 변경
const GENERAL_REQUEST_PATH = '/request'

type GeneralModalProps = {
  open: boolean
  onClose: () => void
}

// 일반 견적 요청 없이 기사님께 지정 견적을 요청하려 할 때 띄운다.
export default function GeneralModal({ open, onClose }: GeneralModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="지정 견적 요청하기"
      mobileSheet={false}
    >
      <p className="text-sm text-black-200 md:text-base">
        일반 견적 요청을 먼저 진행해 주세요.
      </p>
      <ModalButton href={GENERAL_REQUEST_PATH}>일반 견적 요청 하기</ModalButton>
    </Modal>
  )
}
