'use client'

import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import Button from '@/components/common/button/Button'
import ConfirmModal from '@/components/common/modal/ConfirmModal'
import { LoadError, Loading } from '@/components/my-quotes/PageState'
import { MOVE_PROGRESS_STEPS } from '@/constants/moveProgress'
import { formatMessageTime } from '@/features/chat/lib/messageFormat'
import type {
  MoveProgress,
  MoveProgressStep,
} from '@/features/move-progress/api'
import { useMoveProgress } from '@/features/move-progress/hooks/useMoveProgress'
import { useRecordMoveProgress } from '@/features/move-progress/hooks/useRecordMoveProgress'
import { todayInSeoul } from '@/features/sent-quotes/lib/status'
import { cn } from '@/lib/cn'
import { getOptionLabel } from '@/lib/options'

function StepList({ steps }: { steps: MoveProgress['steps'] }) {
  const recordedAt = new Map(
    steps.map(({ step, recordedAt }) => [step, recordedAt]),
  )
  const current = steps.at(-1)?.step

  return (
    <ol className="grid grid-cols-5">
      {MOVE_PROGRESS_STEPS.map(({ value, label }, index) => {
        const time = recordedAt.get(value)

        return (
          <li
            key={value}
            aria-current={value === current ? 'step' : undefined}
            className={cn(
              'relative flex flex-col items-center gap-2 text-center',
              index > 0 &&
                cn(
                  'before:absolute before:top-3 before:right-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 md:before:top-4',
                  time ? 'before:bg-primary-400' : 'before:bg-line-200',
                ),
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'relative z-10 flex size-6 items-center justify-center rounded-full border-2 md:size-8',
                time
                  ? 'border-primary-400 bg-primary-400 text-gray-50'
                  : 'border-gray-300 bg-gray-50',
              )}
            >
              {time && <Check strokeWidth={3} className="size-3.5 md:size-4" />}
            </span>
            <span
              className={cn(
                'text-sm leading-6 font-semibold md:text-base',
                time ? 'text-black-400' : 'text-gray-400',
              )}
            >
              {label}
            </span>
            {time ? (
              <time
                dateTime={time}
                className="text-xs leading-5 text-gray-500 md:text-sm"
              >
                {formatMessageTime(time)}
              </time>
            ) : (
              <span className="text-xs leading-5 text-gray-400 md:text-sm">
                <span aria-hidden="true">-</span>
                <span className="sr-only">기록 전</span>
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

type MoveProgressBodyProps = {
  quoteId: string
  isMoveDay: boolean
  className?: string
}

function MoveProgressBody({
  quoteId,
  isMoveDay,
  className,
}: MoveProgressBodyProps) {
  const headingId = useId()
  const [confirming, setConfirming] = useState<MoveProgressStep | null>(null)
  const { progress, isPending, isLoadingError, refetch, isRefetching } =
    useMoveProgress(quoteId, isMoveDay)
  const { mutate: record, isPending: isRecording } =
    useRecordMoveProgress(quoteId)
  const nextStep = progress?.canRecord ? progress.nextStep : null

  function confirmRecord() {
    if (confirming === null) return
    record(confirming, { onSettled: () => setConfirming(null) })
  }

  function renderBody() {
    if (isPending) {
      return <Loading label="이사 진행 상황을 불러오고 있습니다." />
    }

    if (isLoadingError || !progress) {
      return (
        <LoadError
          message="이사 진행 상황을 불러오지 못했습니다."
          isRetrying={isRefetching}
          onRetry={() => refetch()}
        />
      )
    }

    return (
      <>
        <StepList steps={progress.steps} />
        {nextStep && (
          <Button
            disabled={isRecording}
            onClick={() => setConfirming(nextStep)}
            className="mt-6 w-full md:mx-auto md:mt-8 md:flex md:w-80 lg:h-[54px] lg:w-80 lg:text-base"
          >
            {getOptionLabel(MOVE_PROGRESS_STEPS, nextStep)} 기록하기
          </Button>
        )}
      </>
    )
  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn('py-5 md:py-8', className)}
    >
      <h2
        id={headingId}
        className="pb-5 text-base leading-6 font-semibold md:pb-8 md:text-xl md:leading-8"
      >
        이사 진행 상황
      </h2>
      {renderBody()}

      <ConfirmModal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={confirmRecord}
        title="진행 단계 기록"
        confirmLabel="기록하기"
        isPending={isRecording}
      >
        {confirming && getOptionLabel(MOVE_PROGRESS_STEPS, confirming)} 단계를
        기록할까요?
        <br />
        기록한 단계는 되돌릴 수 없어요.
      </ConfirmModal>
    </section>
  )
}

type MoveProgressSectionProps = Omit<MoveProgressBodyProps, 'isMoveDay'> & {
  moveDate: string
}

export default function MoveProgressSection({
  moveDate,
  ...props
}: MoveProgressSectionProps) {
  const today = todayInSeoul()
  if (moveDate > today) return null

  return <MoveProgressBody {...props} isMoveDay={moveDate === today} />
}
