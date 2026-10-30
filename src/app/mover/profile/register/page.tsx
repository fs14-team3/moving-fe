import MoverProfileForm from '@/components/profile/MoverProfileForm'
import ProfileLayout from '@/components/profile/ProfileLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '기사님 프로필 등록 | 무빙',
}

export default function MoverProfileRegisterPage() {
  return (
    <ProfileLayout
      title="기사님 프로필 등록"
      description="추가 정보를 입력하여 회원가입을 완료해 주세요."
      className="lg:max-w-280"
    >
      <MoverProfileForm />
    </ProfileLayout>
  )
}
