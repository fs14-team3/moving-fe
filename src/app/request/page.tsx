import ActiveMoveRequest from '@/components/move-request/ActiveMoveRequest'
import MoveRequestForm from '@/components/move-request/MoveRequestForm'

export default function MoveRequestPage() {
  const activeRequest = null // TODO: 진행 중인 견적 요청 조회 API 연동

  return (
    <main>
      {activeRequest ? (
        <ActiveMoveRequest />
      ) : (
        <div className="min-h-[calc(100dvh-54px)] w-full bg-white md:bg-background-200 md:px-[22px] md:py-[37px] lg:min-h-[calc(100dvh-88px)] lg:py-10">
          <MoveRequestForm />
        </div>
      )}
    </main>
  )
}
