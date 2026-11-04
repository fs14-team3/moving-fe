import Image from 'next/image'
import Button from '../common/button/Button'

export default function ActiveMoveRequest() {
  return (
    <div className="flex min-h-page flex-col">
      <header className="bg-gray-50">
        <h1 className="mx-auto w-full max-w-400 px-6 py-6 text-lg leading-6 font-semibold md:px-18 md:py-[10px] lg:py-8 lg:text-2xl lg:leading-8">
          견적 요청
        </h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center bg-background-200">
        <Image
          src="/assets/images/existing-request.png"
          width={180}
          height={180}
          alt=""
          className="lg:h-70 lg:w-70"
        />
        <p className="text-center text-sm leading-6 font-normal text-gray-400 lg:text-xl lg:leading-8">
          현재 진행 중인 이사 견적이 있어요! <br /> 진행 중인 이사 완료 후
          새로운 견적을 받아보세요
        </p>
        <Button
          href="/my-quotes"
          className="mt-12 w-[167px] cursor-pointer lg:mt-8 lg:w-[181px]"
        >
          받은 견적 보러가기
        </Button>
      </div>
    </div>
  )
}
