import { ImageIcon } from 'lucide-react'
import ProfileField from '@/components/profile/ProfileField'

// TODO(#39): 이미지 선택 · 미리보기 · 업로드를 연결하고 받은 URL을 imageUrl로 제출
export default function ProfileImageField() {
  return (
    <ProfileField label="프로필 이미지">
      <div className="flex size-25 items-center justify-center rounded-md bg-background-300 lg:size-40 lg:rounded-lg">
        <ImageIcon
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-8 text-gray-400 lg:size-12"
        />
      </div>
    </ProfileField>
  )
}
