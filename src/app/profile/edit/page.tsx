import CustomerProfileForm from '@/components/profile/CustomerProfileForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '프로필 수정 | 무빙',
}

export default function ProfileEditPage() {
  return (
    <ProfileLayout title="프로필 수정">
      <CustomerProfileForm mode="edit" />
    </ProfileLayout>
  )
}
