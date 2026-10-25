'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/common/Button'
import { isActivePath, NAV_ITEMS } from '@/constants/navigation'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { cn } from '@/lib/cn'

export default function Header() {
  const pathname = usePathname()
  const { user, isPending } = useCurrentUser()
  const navItems = NAV_ITEMS[user?.role ?? 'GUEST']

  return (
    <header className="sticky top-0 z-50 border-b border-line-100 bg-white">
      <nav className="mx-auto flex h-[54px] w-full max-w-400 items-center justify-between px-6 md:px-18 lg:h-22 lg:px-5">
        <div className="flex items-center gap-20">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logos/icon-text.png"
              alt="무빙"
              width={480}
              height={176}
              className={cn('h-6 w-auto lg:h-11', user && 'max-md:hidden')}
              loading="eager"
            />
            {user && (
              <Image
                src="/assets/logos/symbol.svg"
                alt="무빙"
                width={58}
                height={60}
                className="h-7.5 w-auto md:hidden"
                loading="eager"
              />
            )}
          </Link>
          {!isPending && (
            <ul className="hidden items-center gap-11 lg:flex">
              {navItems.map(({ label, href }) => {
                const isActive = isActivePath(pathname, href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'text-lg font-bold',
                        isActive ? 'text-black-500' : 'text-gray-400',
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {!isPending && (
          <div className="flex items-center gap-6 lg:gap-8">
            {user ? (
              <>
                {/* TODO(#68): #23에서 알림 목록이 생기면 알림 아이콘에 연결 */}
                <Image
                  src="/assets/icons/alarm.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 lg:size-9"
                />
                {/* TODO(#37): 프로필을 누르면 프로필 드롭다운 열기 */}
                <div className="flex items-center gap-4">
                  <Image
                    src="/assets/icons/profile.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 lg:size-9"
                  />
                  {user.name && (
                    <span className="hidden text-lg font-medium text-black-400 lg:inline">
                      {user.name}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:block">
                <Button href="/login" className="lg:h-[54px] lg:w-auto lg:px-8">
                  로그인
                </Button>
              </div>
            )}
            <button
              type="button"
              aria-label="메뉴 열기"
              className="text-gray-400 lg:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
