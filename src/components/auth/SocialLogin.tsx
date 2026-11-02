import Image from 'next/image'
import { getSocialLoginUrl } from '@/features/auth/api'
import { saveSocialLoginState } from '@/features/auth/lib/social'
import type { Role, SocialProvider } from '@/features/auth/types'

const PROVIDERS: { provider: SocialProvider; label: string }[] = [
  { provider: 'google', label: '구글' },
  { provider: 'kakao', label: '카카오' },
  { provider: 'naver', label: '네이버' },
]

export default function SocialLogin({ role }: { role: Role }) {
  return (
    <div className="mt-12 flex flex-col items-center gap-6 md:mt-18 md:gap-8">
      <p className="text-xs text-black-200 md:text-xl/8">
        SNS 계정으로 간편 가입하기
      </p>
      <ul className="flex gap-4 md:gap-8">
        {PROVIDERS.map(({ provider, label }) => (
          <li key={provider}>
            <a
              href={getSocialLoginUrl(provider, role)}
              onClick={() => saveSocialLoginState(role)}
              className="block rounded-full"
            >
              <Image
                src={`/assets/icons/${provider}.svg`}
                alt={`${label}로 로그인`}
                width={72}
                height={72}
                className="size-13.5 md:size-18"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
