import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-page items-start justify-center overflow-x-clip bg-gray-50 px-6 pt-19 pb-12 md:items-center md:bg-primary-400 md:py-16 lg:py-11">
      <div className="relative">
        <div className="flex flex-col items-center md:w-160 md:rounded-[40px] md:bg-gray-50 md:pt-22 md:pb-17 lg:w-185 lg:pt-18 lg:pb-12">
          {children}
        </div>
        <Image
          src="/assets/images/character-box.webp"
          alt=""
          width={550}
          height={801}
          sizes="(min-width: 1200px) 208px, 132px"
          loading="eager"
          className="pointer-events-none absolute hidden h-auto md:-right-14 md:-bottom-12 md:block md:w-33 lg:right-auto lg:bottom-2 lg:left-full lg:ml-9 lg:w-52"
        />
      </div>
    </div>
  )
}
