import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | 무빙',
}

export default function LoginPage() {
  return (
    <AuthLayout role="CUSTOMER">
      <LoginForm role="CUSTOMER" />
    </AuthLayout>
  )
}
