'use client'

import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import Button from '@/components/common/button/Button'
import ActiveRequestSummary from '@/components/my-quotes/ActiveRequestSummary'
import PendingQuoteCard from '@/components/my-quotes/PendingQuoteCard'
import { CONTAINER } from '@/components/my-quotes/container'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import type { MoveRequestResponse } from '@/features/move-request/types'
import { useConfirmQuote } from '@/features/my-quotes/hooks/useConfirmQuote'
import { usePendingQuotes } from '@/features/my-quotes/hooks/usePendingQuotes'
import { cn } from '@/lib/cn'

// 요청 정보 아래를 회색 배경으로 채운다.
function Body({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 bg-background-200">
      <div className={cn(CONTAINER, 'pt-6 pb-20 lg:pt-10')}>{children}</div>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div role="status" className="flex justify-center py-10">
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

function LoadError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-6 py-20">
      <p className="text-base font-semibold text-black-400 lg:text-lg">
        {message}
      </p>
      <Button
        variant="outlined"
        onClick={onRetry}
        className="w-auto px-8 lg:w-auto"
      >
        다시 시도
      </Button>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center lg:py-32">
      <Image
        src="/assets/images/truck.webp"
        alt=""
        width={870}
        height={658}
        className="h-auto w-45 opacity-40 grayscale md:w-60"
      />
      {children}
    </div>
  )
}

function NoQuotes() {
  return (
    <Empty>
      <p className="text-base text-gray-400 lg:text-lg">
        기사님들이 열심히 확인 중이에요
        <br />곧 견적이 도착할 거에요!
      </p>
    </Empty>
  )
}

function PendingQuoteList({ request }: { request: MoveRequestResponse }) {
  const { pendingQuotes, hasData, isPending, isError, refetch } =
    usePendingQuotes(request.id)
  const { mutate: confirmQuote, isPending: isConfirming } = useConfirmQuote()

  if (isPending) return <Loading label="받은 견적을 불러오고 있습니다." />

  // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
  if (isError && !hasData) {
    return (
      <LoadError
        message="받은 견적을 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    )
  }

  if (pendingQuotes.length === 0) return <NoQuotes />

  return (
    <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      {pendingQuotes.map((quote) => (
        <li key={quote.id}>
          <PendingQuoteCard
            quote={quote}
            moveType={request.moveType}
            onConfirm={() => confirmQuote(quote.id)}
            confirmDisabled={isConfirming}
          />
        </li>
      ))}
    </ul>
  )
}

export default function PendingQuotesPage() {
  const { activeMoveRequest, isPending, isError, isRefetching, refetch } =
    useActiveMoveRequest()

  if (isPending) {
    return (
      <Body>
        <Loading label="진행 중인 견적 요청을 불러오고 있습니다." />
      </Body>
    )
  }

  // 성공하면 요청 또는 null이 오므로, undefined는 처음부터 불러오지 못한 것이다.
  if (isError && activeMoveRequest === undefined) {
    return (
      <Body>
        <LoadError
          message="진행 중인 견적 요청을 불러오지 못했습니다."
          onRetry={() => {
            if (!isRefetching) void refetch()
          }}
        />
      </Body>
    )
  }

  if (!activeMoveRequest) {
    return (
      <Body>
        <Empty>
          <p className="text-base text-gray-400 lg:text-lg">
            진행 중인 견적 요청이 없어요
          </p>
          <Button href="/request" className="w-auto px-8 lg:w-auto">
            견적 요청하기
          </Button>
        </Empty>
      </Body>
    )
  }

  return (
    <>
      {/* TODO(#98): 견적 요청 삭제 API가 생기면 onDelete에 연결한다. */}
      <ActiveRequestSummary request={activeMoveRequest} />
      <Body>
        {/* 견적을 확정한 요청의 견적은 받았던 견적 탭에서 보여준다. */}
        {activeMoveRequest.status === 'PENDING' ? (
          <PendingQuoteList request={activeMoveRequest} />
        ) : (
          <NoQuotes />
        )}
      </Body>
    </>
  )
}
