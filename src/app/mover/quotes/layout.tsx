'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

// 헤더와 왼쪽 끝을 맞춘다. 데스크톱은 가운데 1200px이다.
const CONTAINER = 'mx-auto w-full max-w-310 px-6 md:px-18 lg:px-5'

const TABS = [
  { label: '보낸 견적 조회', href: '/mover/quotes' },
  { label: '반려 요청', href: '/mover/quotes/rejected' },
]

// 기사님 내 견적 관리. 탭마다 주소가 달라서 새로고침해도 보던 탭이 유지된다.
export default function MoverQuotesLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <>
      <div className="bg-white">
        <nav aria-label="내 견적 관리" className={cn(CONTAINER, 'flex gap-6')}>
          {TABS.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'border-b-2 py-4 text-sm leading-6 font-semibold transition-colors lg:py-6 lg:text-xl lg:leading-8',
                  isActive
                    ? 'border-black-400 text-black-400'
                    : 'border-transparent text-gray-400',
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={cn(CONTAINER, 'pt-6 pb-20 lg:pt-10')}>{children}</div>
    </>
  )
}
