import CustomerProfileForm from '@/components/profile/CustomerProfileForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프로필 등록 | 무빙',
}

export default function ProfileRegisterPage() {
  return (
    <ProfileLayout title="프로필 등록">
      <CustomerProfileForm />
    </ProfileLayout>
  )
}
