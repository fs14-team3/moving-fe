'use client'

import type { ServiceType } from '@/constants/services'
import {
  EMPTY_DETAILS_DRAFT,
  isBuildingsComplete,
  isHouseholdComplete,
  toMoveRequestDetails,
  type MoveDetailsDraft,
} from '@/features/move-request/details'
import { useMoveEstimate } from '@/features/move-estimate/hooks/useMoveEstimate'
import { useCreateMoveRequest } from '@/features/move-request/hooks/useCreateMoveRequest'
import { useLeaveGuard } from '@/hooks/useLeaveGuard'
import { cn } from '@/lib/cn'
import { useRouter } from 'next/navigation'
import { type SubmitEvent, useState } from 'react'
import Button from '../common/button/Button'
import ConfirmModal from '../common/modal/ConfirmModal'
import type { SelectedAddress } from './AddressSearchModal'
import MoveAddressStep from './MoveAddressStep'
import MoveBuildingStep from './MoveBuildingStep'
import MoveDateStep from './MoveDateStep'
import MoveEstimateCard from './MoveEstimateCard'
import MoveHouseholdStep from './MoveHouseholdStep'
import MoveItemsStep from './MoveItemsStep'
import MoveMemoStep from './MoveMemoStep'
import MoveRequestStep from './MoveRequestStep'
import MoveTypeStep from './MoveTypeStep'

const STEP_TITLES = [
  '이사 유형을 선택해주세요',
  '이사 예정일을 선택해주세요',
  '이사 지역을 선택해주세요',
  '이사 방식과 집 규모를 알려주세요',
  '출발지와 도착지 환경을 알려주세요',
  '옮길 짐을 알려주세요',
  '기사님께 전할 말이 있나요?',
]

const BASIC_STEP_COUNT = 3
const LAST_STEP = STEP_TITLES.length

function toApiDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function MoveRequestForm() {
  const [currentStep, setCurrentStep] = useState(1)

  const [moveType, setMoveType] = useState<ServiceType | null>(null)
  const [moveDate, setMoveDate] = useState<Date>()
  const [departureAddress, setDepartureAddress] =
    useState<SelectedAddress | null>(null)
  const [arrivalAddress, setArrivalAddress] = useState<SelectedAddress | null>(
    null,
  )
  const [details, setDetails] = useState<MoveDetailsDraft>(EMPTY_DETAILS_DRAFT)

  const router = useRouter()
  const { mutate, isPending } = useCreateMoveRequest()

  const isBasicComplete = Boolean(
    moveType && moveDate && departureAddress && arrivalAddress,
  )
  const detailsBody = toMoveRequestDetails(details, moveType)
  const isFormComplete = isBasicComplete && detailsBody !== null
  const isDetailsPage = currentStep > BASIC_STEP_COUNT
  const isLastStep = currentStep === LAST_STEP
  const hasInput =
    Boolean(moveType || moveDate || departureAddress || arrivalAddress) ||
    details !== EMPTY_DETAILS_DRAFT
  const leaveGuard = useLeaveGuard(hasInput, '/')

  const { estimate, isLoading: isEstimating } = useMoveEstimate(
    moveType && moveDate && departureAddress && arrivalAddress
      ? {
          moveType,
          moveDate: toApiDate(moveDate),
          from: departureAddress.address,
          to: arrivalAddress.address,
        }
      : null,
  )

  const isStepComplete = [
    Boolean(moveType),
    Boolean(moveDate),
    isBasicComplete,
    isHouseholdComplete(details, moveType),
    isBuildingsComplete(details),
    details.boxRange !== null,
  ]
  const canMoveNext = isStepComplete[currentStep - 1]

  function updateDetails(patch: Partial<MoveDetailsDraft>) {
    setDetails((prev) => ({ ...prev, ...patch }))
  }

  function goToStep(step: number) {
    setCurrentStep(step)
    window.scrollTo({ top: 0 })
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !moveType ||
      !moveDate ||
      !departureAddress ||
      !arrivalAddress ||
      !detailsBody ||
      isPending
    ) {
      return
    }

    mutate(
      {
        moveType,
        moveDate: toApiDate(moveDate),
        from: departureAddress,
        to: arrivalAddress,
        details: detailsBody,
      },
      {
        onSuccess: () => {
          leaveGuard.leave()
          router.replace('/my-quotes')
        },
      },
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-[calc(100dvh-54px)] w-full flex-col bg-white px-6 py-9 md:min-h-[1005px] md:w-175 md:rounded-[40px] md:px-10 lg:w-[894px] lg:px-[47px]"
      >
        <header className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 md:hidden">
            {STEP_TITLES.map((title, index) => (
              <span
                key={title}
                className={`size-6 rounded-full bg-gray-100 text-center text-sm leading-6 font-semibold text-gray-400 ${currentStep === index + 1 ? 'bg-primary-400 text-white' : ''}`}
              >
                {index + 1}
              </span>
            ))}
          </div>

          <div className="text-center">
            <h1 className="text-lg leading-8 font-bold md:hidden">
              {STEP_TITLES[currentStep - 1]}
            </h1>

            <h1 className="hidden text-2xl leading-8 font-bold md:block">
              {isDetailsPage
                ? '이사 환경과 짐 정보를 알려주세요'
                : '이사 유형, 예정일과 지역을 선택해주세요'}
            </h1>

            <p className="text-sm leading-6 font-normal text-gray-400 md:mt-2 md:text-base">
              {isDetailsPage
                ? '자세히 알려 주실수록 정확한 견적을 받을 수 있어요'
                : '견적을 요청하면 최대 5개의 견적을 받을 수 있어요 :)'}
            </p>
          </div>
        </header>

        <MoveRequestStep
          title="이사 유형"
          isActive={currentStep === 1}
          isOnPage={!isDetailsPage}
        >
          <MoveTypeStep value={moveType} onChange={setMoveType} />
        </MoveRequestStep>

        <MoveRequestStep
          title="이사 예정일"
          isActive={currentStep === 2}
          isOnPage={!isDetailsPage}
          direction="row"
        >
          <MoveDateStep value={moveDate} onChange={setMoveDate} />
        </MoveRequestStep>

        <MoveRequestStep
          title="이사 지역"
          isActive={currentStep === 3}
          isOnPage={!isDetailsPage}
          direction="row"
        >
          <MoveAddressStep
            departureAddress={departureAddress}
            arrivalAddress={arrivalAddress}
            onDepartureChange={setDepartureAddress}
            onArrivalChange={setArrivalAddress}
          />
        </MoveRequestStep>

        <MoveRequestStep
          title="이사 방식과 집 규모"
          isActive={currentStep === 4}
          isOnPage={isDetailsPage}
        >
          <MoveHouseholdStep
            moveType={moveType}
            draft={details}
            onChange={updateDetails}
          />
        </MoveRequestStep>

        <MoveRequestStep
          title="건물 환경"
          isActive={currentStep === 5}
          isOnPage={isDetailsPage}
        >
          <MoveBuildingStep draft={details} onChange={updateDetails} />
        </MoveRequestStep>

        <MoveRequestStep
          title="짐 정보"
          isActive={currentStep === 6}
          isOnPage={isDetailsPage}
        >
          <MoveItemsStep draft={details} onChange={updateDetails} />
        </MoveRequestStep>

        <MoveRequestStep
          title="요청사항"
          isActive={isLastStep}
          isOnPage={isDetailsPage}
        >
          <MoveMemoStep
            value={details.memo}
            onChange={(memo) => updateDetails({ memo })}
          />
        </MoveRequestStep>

        <div className="mt-auto flex flex-col gap-6">
          {/* 모바일에서는 지역 선택 단계와 마지막 단계에서만 보여 준다. 카드가 없으면(null) 간격도 없앤다. */}
          <div
            className={cn(
              'empty:hidden',
              currentStep !== BASIC_STEP_COUNT &&
                !isLastStep &&
                'max-md:hidden',
            )}
          >
            <MoveEstimateCard estimate={estimate} isLoading={isEstimating} />
          </div>

          <section className="flex gap-4 md:hidden">
            <Button
              variant="outlined"
              type="button"
              disabled={currentStep === 1}
              onClick={() => goToStep(currentStep - 1)}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              이전
            </Button>

            {isLastStep ? (
              <Button
                key="submit"
                variant="solid"
                type="submit"
                disabled={!isFormComplete || isPending}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? '요청 중...' : '견적 요청하기'}
              </Button>
            ) : (
              <Button
                key="next"
                variant="solid"
                type="button"
                disabled={!canMoveNext}
                onClick={() => goToStep(currentStep + 1)}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                다음
              </Button>
            )}
          </section>

          <div className="hidden justify-end gap-4 md:flex">
            {isDetailsPage ? (
              <>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => goToStep(BASIC_STEP_COUNT)}
                  className="cursor-pointer md:h-14 md:w-50 lg:h-14 lg:w-50"
                >
                  이전
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormComplete || isPending}
                  className="cursor-pointer disabled:cursor-not-allowed md:h-14 md:w-50 lg:h-14 lg:w-50"
                >
                  {isPending ? '요청 중...' : '견적 요청하기'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={!isBasicComplete}
                onClick={() => goToStep(BASIC_STEP_COUNT + 1)}
                className="cursor-pointer disabled:cursor-not-allowed md:h-14 md:w-50 lg:h-14 lg:w-50"
              >
                다음
              </Button>
            )}
          </div>
        </div>
      </form>

      <ConfirmModal
        open={leaveGuard.isOpen}
        onClose={leaveGuard.stay}
        onConfirm={leaveGuard.leave}
        title="페이지를 나갈까요?"
        confirmLabel="나가기"
      >
        작성 중인 견적 요청이 있어요.
        <br />
        나가면 입력한 내용이 사라져요.
      </ConfirmModal>
    </>
  )
}
