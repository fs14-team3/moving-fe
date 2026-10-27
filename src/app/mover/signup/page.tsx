import AuthLayout from '@/components/auth/AuthLayout'
import SignupForm from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 회원가입 | 무빙',
}

export default function MoverSignupPage() {
  return (
    <AuthLayout role="MOVER">
      <SignupForm role="MOVER" />
    </AuthLayout>
  )
}
