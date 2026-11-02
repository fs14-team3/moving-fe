import { LoaderCircle } from 'lucide-react'

export default function SessionPending() {
  return (
    <div role="status" className="flex min-h-page items-center justify-center">
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-primary-400"
      />
      <span className="sr-only">로그인 정보를 확인하고 있습니다.</span>
    </div>
  )
}
