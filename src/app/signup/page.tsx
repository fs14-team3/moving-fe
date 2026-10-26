import AuthLayout from '@/components/auth/AuthLayout'
import SignupForm from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회원가입 | 무빙',
}

export default function SignupPage() {
  return (
    <AuthLayout role="CUSTOMER">
      <SignupForm role="CUSTOMER" />
    </AuthLayout>
  )
}
