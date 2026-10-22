'use client'

import { toast } from 'sonner'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">무빙</h1>
      <button
        onClick={() => toast.success(TOAST_MESSAGES.estimate.confirmSuccess)}
      >
        성공 테스트
      </button>
      <button onClick={() => toast.error(TOAST_MESSAGES.estimate.rejectFailed)}>
        실패 테스트
      </button>
      <button onClick={() => toast.info(TOAST_MESSAGES.common.linkCopied)}>
        안내 테스트
      </button>
    </main>
  )
}
