import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/common/Button'

export default function Header() {
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
              className="h-6 w-auto lg:h-11"
              priority
            />
          </Link>
          <Link
            href="/movers"
            className="hidden text-lg font-bold text-black-400 lg:block"
          >
            기사님 찾기
          </Link>
        </div>
        <div className="hidden lg:block">
          <Button href="/login" className="lg:h-[54px] lg:w-auto lg:px-8">
            로그인
          </Button>
        </div>
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
      </nav>
    </header>
  )
}
