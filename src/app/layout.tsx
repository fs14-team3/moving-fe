import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '무빙',
  description: '이사 소비자와 이사 전문가를 연결하는 견적 매칭 서비스',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
