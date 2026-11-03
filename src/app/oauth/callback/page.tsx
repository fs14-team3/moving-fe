import SocialLoginCallback from '@/components/auth/SocialLoginCallback'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 무빙',
}

export default function OAuthCallbackPage() {
  return <SocialLoginCallback />
}
