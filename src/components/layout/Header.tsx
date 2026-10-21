import Image from 'next/image'
import Link from 'next/link'
import logo from '@/assets/logo.png'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 md:h-16 md:px-6">
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/" className="flex items-center gap-1.5">
            <Image src={logo} alt="" width={32} height={32} priority />
            <span className="text-xl font-bold text-primary md:text-2xl">
              무빙
            </span>
          </Link>
          <Link
            href="/movers"
            className="text-sm font-semibold text-gray-900 md:text-base"
          >
            기사님 찾기
          </Link>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover md:px-6"
        >
          로그인
        </Link>
      </nav>
    </header>
  )
}
