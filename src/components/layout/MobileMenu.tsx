'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRef, type MouseEvent } from 'react'
import { isActivePath, type NavItem } from '@/constants/navigation'

type MobileMenuProps = {
  items: NavItem[]
  pathname: string
}

export default function MobileMenu({ items, pathname }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const close = () => dialogRef.current?.close()

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="text-gray-400 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="메뉴"
        onClick={handleBackdropClick}
        className="ml-auto h-dvh max-h-none w-55 max-w-none bg-white backdrop:bg-black-500/50"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[54px] shrink-0 items-center justify-end border-b border-line-100 px-4">
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={close}
              className="p-0.5 text-gray-500"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <ul>
            {items.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={
                    isActivePath(pathname, href) ? 'page' : undefined
                  }
                  onClick={close}
                  className="block px-5 py-6 text-base leading-6.5 font-medium text-black-500"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}
