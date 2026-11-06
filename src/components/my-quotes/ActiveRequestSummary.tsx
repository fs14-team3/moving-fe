import { MoveRight } from 'lucide-react'
import Button from '@/components/common/button/Button'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import { CONTAINER } from '@/components/my-quotes/container'
import type { MoveRequestResponse } from '@/features/move-request/types'
import { formatRequestDate } from '@/features/my-quotes/format'
import {
  formatMoveDate,
  toShortAddress,
} from '@/features/received-requests/format'
import { cn } from '@/lib/cn'

type ActiveRequestSummaryProps = {
  request: MoveRequestResponse
  onDelete?: () => void
}

// 모바일은 라벨과 값을 한 줄 양 끝에, 태블릿 이상은 라벨을 값 위에 둔다.
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between md:flex-col md:items-start md:gap-1">
      <dt className="text-xs text-gray-500 lg:text-sm">{label}</dt>
      <dd className="text-sm font-semibold text-black-400 md:text-base lg:text-lg">
        {value}
      </dd>
    </div>
  )
}

// 내 견적 관리 위쪽의 진행 중인 요청 정보.
// 모바일·태블릿은 삭제하기를 이사 유형 오른쪽에, 데스크톱은 한 줄로 펼쳐 이사일 오른쪽에 둔다.
export default function ActiveRequestSummary({
  request,
  onDelete,
}: ActiveRequestSummaryProps) {
  return (
    <section className="border-b border-line-100 bg-white">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-6 lg:flex lg:items-center lg:gap-10 lg:py-8',
        )}
      >
        <div className="lg:mr-auto">
          <h2 className="text-lg font-semibold text-black-400 lg:text-2xl">
            {MOVE_TYPE[request.moveType].label}
          </h2>
          <p className="mt-1 text-xs text-gray-500 lg:text-sm">
            견적 신청일: {formatRequestDate(request.createdAt)}
          </p>
        </div>

        <dl className="col-span-2 row-start-2 mt-4 flex flex-col gap-2 md:mt-6 md:flex-row md:items-end md:gap-10 lg:mt-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
            <InfoItem
              label="출발지"
              value={toShortAddress(request.from.address)}
            />
            <MoveRight
              aria-hidden="true"
              className="mb-1 hidden size-4 shrink-0 text-gray-500 md:block"
            />
            <InfoItem
              label="도착지"
              value={toShortAddress(request.to.address)}
            />
          </div>
          <InfoItem label="이사일" value={formatMoveDate(request.moveDate)} />
        </dl>

        <Button
          onClick={onDelete}
          className="col-start-2 row-start-1 h-9 w-auto rounded-lg px-4 text-sm lg:h-10 lg:w-auto lg:px-5 lg:text-sm"
        >
          삭제하기
        </Button>
      </div>
    </section>
  )
}
