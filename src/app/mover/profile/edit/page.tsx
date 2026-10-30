import MoverProfileForm from '@/components/profile/MoverProfileForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 프로필 수정 | 무빙',
}

export default function MoverProfileEditPage() {
  return (
    <ProfileLayout title="프로필 수정" className="lg:max-w-280">
      <MoverProfileForm mode="edit" />
    </ProfileLayout>
  )
}
