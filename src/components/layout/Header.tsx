import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-100 bg-white">
      <nav className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 md:px-6 lg:h-20">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo-icon-text.png"
              alt="무빙"
              width={480}
              height={176}
              className="h-8 w-auto lg:h-11"
              priority
            />
          </Link>
          <Link
            href="/movers"
            className="text-sm font-semibold text-black-400 lg:text-lg"
          >
            기사님 찾기
          </Link>
        </div>
        <Link
          href="/login"
          className="rounded-2xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white lg:px-8 lg:py-3 lg:text-base"
        >
          로그인
        </Link>
      </nav>
    </header>
  )
}
