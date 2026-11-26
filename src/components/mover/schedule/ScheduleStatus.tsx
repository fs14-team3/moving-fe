import { LoaderCircle } from 'lucide-react'
import Button from '@/components/common/button/Button'

// 마이페이지의 좁은 칸에 들어가도록 페이지용 로딩 · 오류 화면보다 작게 만들었다.
export function ScheduleLoading() {
  return (
    <div role="status" className="flex justify-center py-8">
      <LoaderCircle
        aria-hidden="true"
        className="size-6 animate-spin text-primary-400"
      />
      <span className="sr-only">이사 일정을 불러오고 있습니다.</span>
    </div>
  )
}

export function ScheduleLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6">
      <p className="text-sm font-semibold text-black-400">
        이사 일정을 불러오지 못했습니다.
      </p>
      <Button
        variant="outlined"
        onClick={onRetry}
        className="h-9 w-auto px-5 text-sm lg:h-9 lg:w-auto lg:text-sm"
      >
        다시 시도
      </Button>
    </div>
  )
}
