'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { CONTAINER } from '@/components/my-quotes/container'
import { cn } from '@/lib/cn'

const TABS = [
  { label: '대기 중인 견적', href: '/my-quotes' },
  { label: '받았던 견적', href: '/my-quotes/history' },
]

// 일반 유저 내 견적 관리. 탭마다 주소가 달라서 새로고침해도 보던 탭이 유지된다.
// 탭 아래 배경은 페이지마다 달라서 각 페이지가 직접 채운다.
export default function MyQuotesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-page flex-col">
      <div className="border-b border-line-100 bg-white">
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

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
