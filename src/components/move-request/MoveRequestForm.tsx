'use client'

import type { ServiceType } from '@/constants/services'
import { useCreateMoveRequest } from '@/features/move-request/hooks/useCreateMoveRequest'
import { useRouter } from 'next/navigation'
import { type SubmitEvent, useState } from 'react'
import Button from '../common/button/Button'
import type { SelectedAddress } from './AddressSearchModal'
import MoveAddressStep from './MoveAddressStep'
import MoveDateStep from './MoveDateStep'
import MoveRequestStep from './MoveRequestStep'
import MoveTypeStep from './MoveTypeStep'

const STEP_TITLES = [
  '이사 유형을 선택해주세요',
  '이사 예정일을 선택해주세요',
  '이사 지역을 선택해주세요',
]

export default function MoveRequestForm() {
  const [currentStep, setCurrentStep] = useState(1)

  const [moveType, setMoveType] = useState<ServiceType | null>(null)
  const [moveDate, setMoveDate] = useState<Date>()
  const [departureAddress, setDepartureAddress] =
    useState<SelectedAddress | null>(null)
  const [arrivalAddress, setArrivalAddress] = useState<SelectedAddress | null>(
    null,
  )

  const router = useRouter()
  const { mutate, isPending } = useCreateMoveRequest()

  const isFormComplete = Boolean(
    moveType && moveDate && departureAddress && arrivalAddress,
  )

  const canMoveNext =
    currentStep === 1
      ? Boolean(moveType)
      : currentStep === 2
        ? Boolean(moveDate)
        : isFormComplete

  function formatMoveDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !moveType ||
      !moveDate ||
      !departureAddress ||
      !arrivalAddress ||
      isPending
    ) {
      return
    }

    mutate(
      {
        moveType,
        moveDate: formatMoveDate(moveDate),
        from: departureAddress,
        to: arrivalAddress,
      },
      {
        onSuccess: () => {
          // TODO: 내 견적 관리 페이지가 생기면 그 경로로 이동
          router.push('/my-quotes')
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-[calc(100dvh-54px)] w-full flex-col bg-white px-6 py-9 md:min-h-[1005px] md:w-175 md:rounded-[40px] md:px-10 lg:w-[894px] lg:px-[47px]"
    >
      <header className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 md:hidden">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`size-6 rounded-full bg-gray-100 text-center text-sm leading-6 font-semibold text-gray-400 ${currentStep === step ? 'bg-primary-400 text-white' : ''}`}
            >
              {step}
            </span>
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-lg leading-8 font-bold md:hidden">
            {STEP_TITLES[currentStep - 1]}
          </h1>

          <h1 className="hidden text-2xl leading-8 font-bold md:block">
            이사 유형, 예정일과 지역을 선택해주세요
          </h1>

          <p className="text-sm leading-6 font-normal text-gray-400 md:mt-2 md:text-base">
            견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)
          </p>
        </div>
      </header>

      <MoveRequestStep title="이사 유형" isActive={currentStep === 1}>
        <MoveTypeStep value={moveType} onChange={setMoveType} />
      </MoveRequestStep>

      <MoveRequestStep
        title="이사 예정일"
        isActive={currentStep === 2}
        direction="row"
      >
        <MoveDateStep value={moveDate} onChange={setMoveDate} />
      </MoveRequestStep>

      <MoveRequestStep
        title="이사 지역"
        isActive={currentStep === 3}
        direction="row"
      >
        <MoveAddressStep
          departureAddress={departureAddress}
          arrivalAddress={arrivalAddress}
          onDepartureChange={setDepartureAddress}
          onArrivalChange={setArrivalAddress}
        />
      </MoveRequestStep>

      <section className="mt-auto flex gap-4 md:hidden">
        <Button
          variant="outlined"
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => prev - 1)}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          이전
        </Button>

        <Button
          variant="solid"
          type={currentStep === 3 ? 'submit' : 'button'}
          disabled={!canMoveNext || isPending}
          onClick={
            currentStep < 3
              ? () => setCurrentStep((prev) => prev + 1)
              : undefined
          }
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending
            ? '요청 중...'
            : currentStep === 3
              ? '견적 요청하기'
              : '다음'}
        </Button>
      </section>

      <Button
        type="submit"
        disabled={!isFormComplete || isPending}
        className="mt-auto hidden self-end md:flex md:h-14 md:w-50 lg:h-14 lg:w-50"
      >
        {isPending ? '요청 중...' : '견적 요청하기'}
      </Button>
    </form>
  )
}
