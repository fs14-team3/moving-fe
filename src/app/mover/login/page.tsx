import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 로그인 | 무빙',
}

export default function MoverLoginPage() {
  return (
    <AuthLayout role="MOVER">
      <LoginForm role="MOVER" />
    </AuthLayout>
  )
}
