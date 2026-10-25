import { Building2, FileText, House, Package } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import Chip from '@/components/common/Chip'

export type MoveType = 'small' | 'home' | 'office'

type RequestSummaryProps = {
  moveType: MoveType
  isDesignated?: boolean
  // '김인서 고객님', '김코드 기사님'처럼 호칭까지 포함한 이름
  name: string
  profileImage?: string
  from: string
  to: string
  // 화면에 그대로 보여줄 날짜 문자열 (예: '2024년 07월 01일 (월)')
  movingDate: string
}

const ICON = 'size-3.5 lg:size-4'

const MOVE_TYPE: Record<MoveType, { label: string; icon: ReactNode }> = {
  small: { label: '소형이사', icon: <Package className={ICON} /> },
  home: { label: '가정이사', icon: <House className={ICON} /> },
  office: { label: '사무실이사', icon: <Building2 className={ICON} /> },
}

// 모바일: 라벨과 값을 한 줄에 / 태블릿 이상: 라벨을 값 위에 둔다.
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-1">
      <dt className="text-xs text-gray-500 lg:text-sm">{label}</dt>
      <dd className="text-sm font-semibold lg:text-base">{value}</dd>
    </div>
  )
}

export default function RequestSummary({
  moveType,
  isDesignated = false,
  name,
  profileImage,
  from,
  to,
  movingDate,
}: RequestSummaryProps) {
  const { label, icon } = MOVE_TYPE[moveType]

  return (
    <section className="border-b border-line-100 pb-5 lg:pb-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={icon}>{label}</Chip>
            {isDesignated && (
              <Chip icon={<FileText className={ICON} />}>지정 견적 요청</Chip>
            )}
          </div>
          <p className="mt-3 text-base font-semibold lg:mt-4 lg:text-xl">
            {name}
          </p>
        </div>
        {profileImage && (
          <Image
            src={profileImage}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-xl object-cover lg:size-14"
          />
        )}
      </div>

      <dl className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:gap-6 lg:mt-5">
        <div className="flex items-end gap-2">
          <InfoItem label="출발지" value={from} />
          <span aria-hidden="true" className="text-gray-400">
            →
          </span>
          <InfoItem label="도착지" value={to} />
        </div>
        <InfoItem label="이사일" value={movingDate} />
      </dl>
    </section>
  )
}
