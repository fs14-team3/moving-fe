'use client'

import Image from 'next/image'
import { useState } from 'react'
import ReviewModal from '@/components/common/modal/ReviewModal'
import Pagination from '@/components/common/pagination/Pagination'
import { LoadError, Loading, PageBody } from '@/components/my-quotes/PageState'
import WritableReviewCard from '@/components/reviews/WritableReviewCard'
import {
  formatMoveDate,
  toShortAddress,
} from '@/features/received-requests/format'
import type { ReviewTarget } from '@/features/reviews/api'
import {
  isStaleReviewTarget,
  useCreateReview,
} from '@/features/reviews/hooks/useCreateReview'
import { useWritableReviews } from '@/features/reviews/hooks/useWritableReviews'

const PAGE_SIZE = 4

function NoWritableReviews() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 lg:py-32">
      <Image
        src="/assets/images/empty-without-text.png"
        width={240}
        height={240}
        alt=""
        className="size-45 md:size-60"
      />
      <p className="text-base text-gray-400 lg:text-lg">
        작성 가능한 리뷰가 없어요!
      </p>
    </div>
  )
}

function WritableReviewList() {
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState<ReviewTarget | null>(null)
  const {
    writableReviews,
    totalPages,
    hasData,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useWritableReviews({ page, pageSize: PAGE_SIZE })
  const { mutate: createReview, isPending: isCreating } = useCreateReview()

  // 리뷰를 쓴 견적은 목록에서 빠진다. 그 페이지의 마지막 카드였다면 이전 페이지로 옮긴다.
  function handleCreated() {
    setTarget(null)
    if (writableReviews.length === 1 && page > 1) setPage(page - 1)
  }

  if (isPending)
    return <Loading label="작성 가능한 리뷰를 불러오고 있습니다." />

  // 다시 불러오기만 실패했다면 이미 받은 목록을 그대로 보여준다.
  if (isError && !hasData) {
    return (
      <LoadError
        message="작성 가능한 리뷰를 불러오지 못했습니다."
        onRetry={() => refetch()}
      />
    )
  }

  if (writableReviews.length === 0) return <NoWritableReviews />

  return (
    <>
      <ul className="flex flex-col gap-4 lg:gap-6">
        {writableReviews.map((item) => (
          <li key={item.quoteId}>
            <WritableReviewCard target={item} onWrite={() => setTarget(item)} />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center lg:mt-10">
        <Pagination
          page={page}
          totalPage={totalPages}
          onPageChange={setPage}
          disabled={isPlaceholderData}
        />
      </div>

      {target && (
        <ReviewModal
          open
          // 등록하는 중에 닫으면 결과를 모달에서 볼 수 없어서, 끝날 때까지 닫지 않는다.
          onClose={() => {
            if (!isCreating) setTarget(null)
          }}
          request={{
            variant: 'mover',
            moveType: target.moveType,
            isDesignated: target.isDesignated,
            name: `${target.mover.nickname?.trim() || '익명'} 기사님`,
            moverProfileImage: target.mover.imageUrl ?? undefined,
            from: target.from ? toShortAddress(target.from.address) : '-',
            to: target.to ? toShortAddress(target.to.address) : '-',
            movingDate: formatMoveDate(target.moveDate),
          }}
          isSubmitting={isCreating}
          onSubmit={(review) =>
            createReview(
              { quoteId: target.quoteId, ...review },
              {
                onSuccess: handleCreated,
                // 다시 보내도 같은 오류가 나는 견적은 목록에서 사라지므로 모달도 닫는다.
                onError: (error) => {
                  if (isStaleReviewTarget(error)) setTarget(null)
                },
              },
            )
          }
        />
      )}
    </>
  )
}

export default function WritableReviewsPage() {
  return (
    <PageBody>
      <WritableReviewList />
    </PageBody>
  )
}
