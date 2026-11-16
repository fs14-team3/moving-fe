import Image from 'next/image'
import type { ReactNode } from 'react'
import { MOVE_TYPE } from '@/components/common/modal/Modal'
import type { ServiceType } from '@/constants/services'
import { formatRequestDate } from '@/features/my-quotes/format'
import { formatMoveDate } from '@/features/received-requests/format'
import { cn } from '@/lib/cn'

export function QuoteDetailHeader({ children }: { children?: ReactNode }) {
  return (
    <>
      <header className="px-7.5 py-3.5 md:px-18 lg:mx-auto lg:max-w-338.5 lg:py-8">
        <h1 className="text-lg leading-6 font-semibold lg:text-2xl lg:leading-8">
          견적 상세
        </h1>
      </header>

      <div className="relative">
        <div
          aria-hidden="true"
          className="h-30.5 w-full bg-[url('/assets/images/mover_detail_banner.png')] bg-cover bg-center bg-no-repeat md:h-39.25 lg:h-45"
        />
        {children}
      </div>
    </>
  )
}

export function ConfirmedLabel() {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Image
        src="/assets/icons/confirmed-badge.svg"
        width={16}
        height={16}
        alt=""
      />
      <p className="text-base leading-6 font-bold text-primary-400">확정견적</p>
    </div>
  )
}

export function QuotePrice({ price }: { price: number }) {
  return (
    <section className="flex items-center justify-between border-b border-line-100 py-5 md:justify-start md:gap-15 md:py-8">
      <h2 className="text-base leading-6 font-semibold md:text-xl md:leading-8">
        견적가
      </h2>
      <p className="text-xl leading-8 font-bold md:text-2xl">
        {price.toLocaleString('ko-KR')}원
      </p>
    </section>
  )
}

type QuoteInfoProps = {
  moveRequest: {
    createdAt: string
    moveType: ServiceType
    moveDate: string
    from: { address: string }
    to: { address: string }
  }
  className?: string
}

export function QuoteInfo({ moveRequest, className }: QuoteInfoProps) {
  const rows = [
    { label: '견적 요청일', value: formatRequestDate(moveRequest.createdAt) },
    { label: '서비스', value: MOVE_TYPE[moveRequest.moveType].label },
    { label: '이용일', value: formatMoveDate(moveRequest.moveDate) },
    { label: '출발지', value: moveRequest.from.address },
    { label: '도착지', value: moveRequest.to.address },
  ]

  return (
    <section className={cn('py-5 md:py-8', className)}>
      <h2 className="pb-5 text-base leading-6 font-semibold md:pb-8 md:text-xl md:leading-8">
        견적 정보
      </h2>
      <dl className="flex flex-col gap-3 md:gap-4">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-6 md:justify-start"
          >
            <dt className="shrink-0 text-base leading-6 text-gray-400 md:w-22.5">
              {label}
            </dt>
            <dd className="text-right text-base leading-6 font-medium md:text-left">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
