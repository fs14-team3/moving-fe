import {
  getMoveBasicRows,
  getMoveDetailRows,
} from '@/features/move-request/format'
import type { CreateMoveRequestBody } from '@/features/move-request/types'
import MoveDetailsList from './MoveDetailsList'

type MoveReviewStepProps = {
  request: Required<CreateMoveRequestBody>
  isPending: boolean
  onEditBasic: () => void
  onEditDetails: () => void
}

export default function MoveReviewStep({
  request,
  isPending,
  onEditBasic,
  onEditDetails,
}: MoveReviewStepProps) {
  const sections = [
    {
      title: '기본 정보',
      rows: getMoveBasicRows(request),
      onEdit: onEditBasic,
    },
    {
      title: '상세 정보',
      rows: getMoveDetailRows(request.details),
      onEdit: onEditDetails,
    },
  ]

  return (
    <div className="flex flex-col gap-8 py-8">
      {sections.map(({ title, rows, onEdit }) => (
        <div key={title} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base leading-6 font-bold md:text-lg">
              {title}
            </h2>
            <button
              type="button"
              aria-label={`${title} 수정`}
              disabled={isPending}
              onClick={onEdit}
              className="cursor-pointer text-sm leading-6 font-medium text-gray-400 underline underline-offset-2 disabled:cursor-not-allowed md:text-base"
            >
              수정
            </button>
          </div>
          <MoveDetailsList label={title} rows={rows} />
        </div>
      ))}
    </div>
  )
}
