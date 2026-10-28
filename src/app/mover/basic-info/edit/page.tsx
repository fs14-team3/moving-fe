import BasicInfoForm from '@/components/profile/BasicInfoForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 기본정보 수정 | 무빙',
}

export default function MoverBasicInfoEditPage() {
  return (
    <ProfileLayout title="기본정보 수정" className="lg:max-w-280">
      <BasicInfoForm />
    </ProfileLayout>
  )
}
