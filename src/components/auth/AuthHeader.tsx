import Image from 'next/image'
import Link from 'next/link'
import AuthPrompt from '@/components/auth/AuthPrompt'
import type { Role } from '@/features/auth/types'

const OTHER_ROLE: Record<
  Role,
  { role: Role; question: string; linkLabel: string }
> = {
  CUSTOMER: {
    role: 'MOVER',
    question: '기사님이신가요?',
    linkLabel: '기사님 전용 페이지',
  },
  MOVER: {
    role: 'CUSTOMER',
    question: '일반 유저라면?',
    linkLabel: '일반 유저 전용 페이지',
  },
}

type AuthHeaderProps = {
  title: string
  role: Role
  paths: Record<Role, string>
}

export default function AuthHeader({ title, role, paths }: AuthHeaderProps) {
  const other = OTHER_ROLE[role]

  return (
    <>
      <h1 className="sr-only">{title}</h1>
      <Link href="/">
        <Image
          src="/assets/logos/text.png"
          alt="무빙"
          width={266}
          height={138}
          loading="eager"
          className="block h-11 w-auto md:h-[54px]"
        />
      </Link>
      <AuthPrompt
        question={other.question}
        linkLabel={other.linkLabel}
        href={paths[other.role]}
        className="mt-6 md:mt-8"
      />
    </>
  )
}
