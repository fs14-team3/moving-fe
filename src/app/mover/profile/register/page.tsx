import MoverProfileForm from '@/components/profile/MoverProfileForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 프로필 등록 | 무빙',
}

export default function MoverProfileRegisterPage() {
  return (
    <ProfileLayout title="기사님 프로필 등록" className="lg:max-w-280">
      <MoverProfileForm />
    </ProfileLayout>
  )
}
