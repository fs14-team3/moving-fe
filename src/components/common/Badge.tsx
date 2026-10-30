import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeProps = {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

// 이사 유형, 지정 견적 요청 같은 정보 표시용 라벨. 클릭 동작은 없다.
export default function Badge({ icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-primary-100 px-1.5 py-1 text-xs font-semibold text-primary-400 md:px-2 md:text-sm',
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
