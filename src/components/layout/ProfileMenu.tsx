'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { PROFILE_MENU_ITEMS } from '@/constants/navigation'
import type { Me, Role } from '@/features/auth/types'
import { useLogout } from '@/features/auth/hooks/useLogout'

const NAME_SUFFIX: Record<Role, string> = {
  CUSTOMER: '고객님',
  MOVER: '기사님',
}

type ProfileMenuProps = {
  user: Me
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const { mutate: logout, isPending } = useLogout()

  const close = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-4"
      >
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
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="absolute top-full right-5 w-37.5 rounded-2xl border border-line-200 bg-white px-1 shadow-sm"
        >
          <div className="pt-2.5 pb-2">
            {user.name && (
              <p className="flex h-10 items-center gap-1 px-3 font-semibold text-black-400">
                <span className="min-w-0 truncate" title={user.name}>
                  {user.name}
                </span>
                <span className="shrink-0">{NAME_SUFFIX[user.role]}</span>
              </p>
            )}
            <ul>
              {PROFILE_MENU_ITEMS[user.role].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-black-400 hover:bg-background-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            disabled={isPending}
            className="h-10.5 w-full border-t border-line-100 text-xs font-medium text-gray-500 disabled:text-gray-400"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
