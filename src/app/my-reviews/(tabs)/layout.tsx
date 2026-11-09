'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { CONTAINER } from '@/components/my-quotes/container'
import { cn } from '@/lib/cn'

const TABS = [
  { label: '작성 가능한 리뷰', href: '/my-reviews' },
  { label: '내가 작성한 리뷰', href: '/my-reviews/written' },
]

// 일반 유저 이사 리뷰. 탭마다 주소가 달라서 새로고침해도 보던 탭이 유지된다.
export default function MyReviewsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-page flex-col">
      <div className="border-b border-line-100 bg-white">
        <nav aria-label="이사 리뷰" className={cn(CONTAINER, 'flex gap-6')}>
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
