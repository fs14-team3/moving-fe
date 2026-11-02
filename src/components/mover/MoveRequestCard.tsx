import { FileText, MoveRight } from 'lucide-react'
import type { ReactNode } from 'react'
import Badge from '@/components/common/Badge'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import type { ReceivedRequest } from '@/features/received-requests/api'
import {
  formatMoveDate,
  toCustomerName,
  toShortAddress,
} from '@/features/received-requests/format'

type MoveRequestCardProps = {
  request: ReceivedRequest
  // 오른쪽 위에 둘 내용 (요청 시간 등)
  aside?: ReactNode
  // 카드 아래쪽에 둘 내용 (버튼 등)
  children?: ReactNode
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-gray-500 lg:text-sm">{label}</dt>
      <dd className="text-sm font-semibold text-black-400 lg:text-base">
        {value}
      </dd>
    </div>
  )
}

// 기사님이 보는 이사 요청 카드. 받은 요청 · 반려한 요청이 함께 쓴다.
export default function MoveRequestCard({
  request,
  aside,
  children,
}: MoveRequestCardProps) {
  const { label, icon } = MOVE_TYPE[request.moveType]

  return (
    <article className="rounded-2xl border border-line-100 bg-white px-5 py-6 shadow-sm lg:px-6 lg:py-7">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge icon={icon}>{label}</Badge>
          {request.isDesignated && (
            <Badge icon={<FileText className="size-3.5 md:size-4" />}>
              지정 견적 요청
            </Badge>
          )}
        </div>
        {aside}
      </div>

      <h2 className="mt-3 border-b border-line-100 pb-3 text-base font-semibold text-black-400 lg:mt-4 lg:pb-4 lg:text-lg">
        {toCustomerName(request)}
      </h2>

      {/* 모바일은 출발지·도착지 아래에 이사일, 태블릿 이상은 한 줄 양 끝에 둔다. */}
      <dl className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between lg:mt-4">
        <div className="flex items-end gap-3">
          <InfoItem
            label="출발지"
            value={toShortAddress(request.from.address)}
          />
          <MoveRight
            aria-hidden="true"
            className="mb-0.5 size-4 shrink-0 text-gray-500 lg:mb-1"
          />
          <InfoItem label="도착지" value={toShortAddress(request.to.address)} />
        </div>
        <InfoItem label="이사일" value={formatMoveDate(request.moveDate)} />
      </dl>

      {children}
    </article>
  )
}
