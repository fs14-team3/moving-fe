import { FileText } from 'lucide-react'
import Badge from '@/components/common/Badge'
import { MOVE_TYPE_ICON } from '@/components/common/modal/Modal'
import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { getOptionLabel } from '@/lib/options'

// 견적 카드 위쪽의 이사 유형 · 지정 견적 요청 배지
export default function QuoteBadges({
  moveType,
  isDesignated,
}: {
  moveType: ServiceType
  isDesignated: boolean
}) {
  const icon = MOVE_TYPE_ICON[moveType]
  const label = getOptionLabel(SERVICE_TYPE_OPTIONS, moveType)

  return (
    <div className="flex flex-wrap gap-2">
      <Badge icon={icon}>{label}</Badge>
      {isDesignated && (
        <Badge icon={<FileText className="size-3.5 md:size-4" />}>
          지정 견적 요청
        </Badge>
      )}
    </div>
  )
}
