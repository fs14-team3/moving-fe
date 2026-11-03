import MyMoverProfile from '@/components/mover/MyMoverProfile'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '마이페이지 | 무빙',
}

export default function MoverMyPage() {
  return <MyMoverProfile />
}
