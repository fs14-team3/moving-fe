'use client'

import { useState } from 'react'
import Button from '@/components/common/button/Button'
import ActiveRequestSummary from '@/components/my-quotes/ActiveRequestSummary'
import DeleteRequestModal from '@/components/my-quotes/DeleteRequestModal'
import {
  Empty,
  LoadError,
  Loading,
  PageBody,
} from '@/components/my-quotes/PageState'
import PendingQuoteCard from '@/components/my-quotes/PendingQuoteCard'
import { useActiveMoveRequest } from '@/features/move-request/hooks/useActiveMoveRequest'
import { useDeleteMoveRequest } from '@/features/move-request/hooks/useDeleteMoveRequest'
import type { MoveRequestResponse } from '@/features/move-request/types'
import { useConfirmQuote } from '@/features/my-quotes/hooks/useConfirmQuote'
import { usePendingQuotes } from '@/features/my-quotes/hooks/usePendingQuotes'

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
  const { mutate: deleteRequest, isPending: isDeleting } =
    useDeleteMoveRequest()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (isPending) {
    return (
      <PageBody>
        <Loading label="진행 중인 견적 요청을 불러오고 있습니다." />
      </PageBody>
    )
  }

  // 성공하면 요청 또는 null이 오므로, undefined는 처음부터 불러오지 못한 것이다.
  if (isError && activeMoveRequest === undefined) {
    return (
      <PageBody>
        <LoadError
          message="진행 중인 견적 요청을 불러오지 못했습니다."
          onRetry={() => {
            if (!isRefetching) void refetch()
          }}
        />
      </PageBody>
    )
  }

  if (!activeMoveRequest) {
    return (
      <PageBody>
        <Empty>
          <p className="text-base text-gray-400 lg:text-lg">
            진행 중인 견적 요청이 없어요
          </p>
          <Button href="/request" className="w-auto px-8 lg:w-auto">
            견적 요청하기
          </Button>
        </Empty>
      </PageBody>
    )
  }

  // 견적이 하나라도 도착한 요청은 BE에서 삭제를 막는다.
  const canDelete =
    activeMoveRequest.status === 'PENDING' && activeMoveRequest.quoteCount === 0

  return (
    <>
      <ActiveRequestSummary
        request={activeMoveRequest}
        onDelete={canDelete ? () => setIsDeleteOpen(true) : undefined}
      />
      <DeleteRequestModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() =>
          deleteRequest(activeMoveRequest.id, {
            onSettled: () => setIsDeleteOpen(false),
          })
        }
        isDeleting={isDeleting}
      />
      <PageBody>
        {/* 견적을 확정한 요청의 견적은 받았던 견적 탭에서 보여준다. */}
        {activeMoveRequest.status === 'PENDING' ? (
          <PendingQuoteList request={activeMoveRequest} />
        ) : (
          <NoQuotes />
        )}
      </PageBody>
    </>
  )
}
