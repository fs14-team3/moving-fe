import LandingImage from '@/components/landing/LandingImage'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <section className='flex flex-col items-center gap-5 bg-[url("/assets/landing/img1_bg.png")] bg-cover bg-center bg-no-repeat py-16 md:gap-7 md:py-19'>
        <Image
          src="/assets/landing/img1.png"
          width={100}
          height={62}
          alt=""
          className="md:h-25 md:w-40"
        />
        <div className="text-center">
          <h1 className="text-xl leading-8 font-bold text-white md:text-3xl md:leading-10 md:font-bold">
            이사업체, 어떻게 고르세요?
          </h1>
          <p className="mt-2 text-base leading-6 font-normal text-gray-200 md:mt-4 md:text-lg">
            무빙은 여러 견적을 한눈에 비교해
            <br />
            이사업체 선정 과정을 간편하게 바꿔드려요
          </p>
        </div>
      </section>

      <section className="py-[61px] md:px-8 lg:px-0">
        <div className="mx-auto flex flex-col justify-center gap-9 md:max-w-[677px] md:gap-10 lg:max-w-[1086px] lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <h2 className="ml-8 text-xl leading-8 font-bold md:ml-0 md:text-3xl md:leading-10">
            번거로운 선정 과정,
            <br />
            이사 유형부터 선택해요
          </h2>
          <LandingImage
            name="img2"
            className="block h-auto w-full md:mx-auto md:max-w-[677px] lg:mx-0 lg:w-[693px]"
          />
        </div>
      </section>

      <section className="md:px-8">
        <div className="relative mx-auto w-full md:max-w-[679px] lg:max-w-[1402px]">
          <LandingImage name="img3" className="block h-auto w-full" />
          <h2 className="absolute top-10 right-8 text-right text-xl leading-8 font-bold text-white md:top-[49px] md:right-[54px] md:text-3xl md:leading-10 lg:top-[19.3%] lg:right-[19.1%] lg:text-[clamp(24px,2.14vw,30px)] lg:leading-[1.35]">
            원하는 이사 서비스를 요청하고
            <br />
            견적을 받아보세요
          </h2>
        </div>
      </section>

      <section className="relative mx-auto w-full lg:max-w-[1920px]">
        <LandingImage name="img4" className="block h-auto w-full" />
        <h2 className="absolute top-10 left-8 text-xl leading-8 font-bold md:top-[5.6%] md:left-[4.3%] md:text-3xl md:leading-10 lg:top-[14.2%] lg:left-[21.7%] lg:text-[clamp(24px,1.56vw,30px)] lg:leading-[1.35]">
          여러 업체의 견적을
          <br />
          한눈에 비교하고 선택해요
        </h2>
      </section>

      <section className="flex h-50 flex-col items-center justify-center gap-3 bg-primary-400 md:h-[311px] md:gap-8">
        <Image
          src="/assets/landing/logo.png"
          width={56}
          height={56}
          alt=""
          className="h-14 w-auto md:h-25"
        />
        <p className="text-center text-base font-bold text-white md:text-3xl md:font-bold">
          복잡한 이사 준비,
          <br className="md:hidden" />
          무빙 하나면 끝!
        </p>
      </section>
    </div>
  )
}
