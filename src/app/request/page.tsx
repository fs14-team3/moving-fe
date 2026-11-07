'use client'

import Button from '@/components/common/button/Button'
import ActiveMoveRequest from '@/components/move-request/ActiveMoveRequest'
import MoveRequestForm from '@/components/move-request/MoveRequestForm'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import { LoaderCircle } from 'lucide-react'

export default function MoveRequestPage() {
  const { activeMoveRequest, isPending, isError, isRefetching, refetch } =
    useActiveMoveRequest()

  return (
    <main>
      {isPending ? (
        <div
          role="status"
          className="flex min-h-page w-full flex-col items-center justify-center gap-3"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-8 animate-spin text-primary-400"
          />
          <p className="leading-6 text-gray-400 lg:text-xl lg:leading-8">
            진행 중인 견적 요청을 불러오고 있습니다.
          </p>
        </div>
      ) : isError && activeMoveRequest === undefined ? (
        <div
          role="alert"
          className="flex min-h-page w-full flex-col items-center justify-center gap-3"
        >
          <p className="leading-6 text-gray-400 lg:text-xl lg:leading-8">
            진행 중인 견적 요청을 불러오지 못했습니다.
          </p>
          <Button
            disabled={isRefetching}
            onClick={() => refetch()}
            className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto lg:text-sm"
          >
            다시 시도
          </Button>
        </div>
      ) : activeMoveRequest ? (
        <ActiveMoveRequest />
      ) : (
        <div className="min-h-[calc(100dvh-54px)] w-full bg-white md:bg-background-200 md:px-[22px] md:py-[37px] lg:min-h-[calc(100dvh-88px)] lg:py-10">
          <MoveRequestForm />
        </div>
      )}
    </main>
  )
}
