import Image from 'next/image'

const MOVE_TYPES = [
  {
    src: '/assets/images/moving-box.png',
    label: '소형 이사',
    description: '원룸, 투룸, 20평대 미만',
  },
  {
    src: '/assets/images/truck.webp',
    label: '가정 이사',
    description: '쓰리룸, 20평대 미만',
  },
  {
    src: '/assets/images/office-building.png',
    label: '기업, 사무실 이사',
    description: '사무실, 상업 공간',
  },
]

function MoveTypeCard({
  src,
  label,
  description,
}: {
  src: string
  label: string
  description: string
}) {
  return (
    <div className="group flex size-31 shrink-0 flex-col items-center justify-center gap-[10px] rounded-2xl bg-background-200 transition-transform hover:scale-118 hover:rounded-3xl hover:border hover:border-primary-300 hover:bg-primary-100 md:size-50 md:hover:border-[2px]">
      <Image
        src={src}
        width={68}
        height={68}
        alt=""
        className={`size-17 object-contain md:size-25 ${src.endsWith('truck.webp') ? 'object-bottom' : ''}`}
      />
      <div>
        <p className="text-center text-[9px] leading-3 leading-5 font-bold group-hover:text-primary-500 md:text-base md:leading-5">
          {label}
        </p>
        <p className="mt-[2px] text-center text-[6px] leading-3 font-normal text-gray-500 md:mt-[3px] md:text-xs md:leading-4">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <section className='flex h-78 flex-col items-center justify-center gap-5 bg-[url("/assets/landing/img1_bg.png")] bg-cover bg-center bg-no-repeat md:h-101 md:gap-7'>
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
        <div className="mx-auto flex w-full flex-col justify-center gap-9 md:max-w-[677px] md:gap-10 lg:max-w-[1086px] lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <h2 className="mx-auto w-full max-w-[375px] pl-8 text-xl leading-8 font-bold md:max-w-none md:pl-0 md:text-3xl md:leading-10 lg:w-auto">
            번거로운 선정 과정,
            <br />
            이사 유형부터 선택해요
          </h2>
          <div className="flex w-full min-w-0 items-center justify-center gap-5 overflow-hidden md:gap-8 lg:w-auto lg:overflow-visible">
            {MOVE_TYPES.map((type) => (
              <MoveTypeCard
                key={type.label}
                src={type.src}
                label={type.label}
                description={type.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="h-124 md:h-208 md:px-8 lg:h-212">
        <div className="relative isolate mx-auto w-full pt-[30px] md:max-w-[679px] md:pt-12 lg:flex lg:max-w-[1402px] lg:flex-row-reverse lg:px-15">
          <div className='absolute inset-x-0 top-0 -z-10 h-51 bg-[url("/assets/images/mover_detail_banner.png")] bg-cover bg-center bg-no-repeat md:h-83 md:w-170 md:rounded-4xl lg:h-100 lg:w-auto' />
          <h2 className="mx-auto w-full max-w-[375px] pr-8 text-right text-xl leading-8 font-bold text-white md:max-w-none md:pr-13 md:text-3xl md:leading-10 lg:absolute lg:top-30 lg:left-162 lg:w-auto lg:text-left">
            원하는 이사 서비스를 요청하고
            <br />
            견적을 받아보세요
          </h2>
          <div className="mt-[30px] flex justify-center gap-3 md:gap-4 lg:justify-between">
            <Image
              src="/assets/landing/quote-screen.png"
              width={2082}
              height={2730}
              alt=""
              className="mt-2 h-80 w-auto rounded-2xl shadow-xl md:mt-4 md:h-153 lg:absolute lg:top-10 lg:left-20 lg:h-172"
            />
            <Image
              src="/assets/images/character-box.webp"
              width={550}
              height={801}
              alt=""
              className="h-[100px] w-auto md:h-40 lg:absolute lg:top-50 lg:right-10 lg:h-60"
            />
          </div>
        </div>
      </section>

      <section className="relative isolate h-269 w-full overflow-hidden pt-14 md:h-252 lg:flex lg:items-start lg:justify-center lg:gap-10 lg:pt-30">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-220 bg-primary-100 md:h-177 lg:h-161" />
        <div className="mx-auto flex w-full max-w-[375px] flex-col gap-1 md:max-w-[677px] md:gap-15 lg:mx-0">
          <h2 className="pl-8 text-xl leading-8 font-bold md:pl-0 md:text-3xl md:leading-10">
            여러 업체의 견적을
            <br />
            한눈에 비교하고 선택해요
          </h2>
          <Image
            src="/assets/landing/buildings.png"
            width={1272}
            height={528}
            alt=""
            className="relative z-10 h-26 w-auto translate-x-17 self-end md:translate-x-0 md:pr-18 lg:self-start"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-5 pt-10 md:grid md:grid-cols-[auto_auto] md:items-start md:justify-items-center md:gap-x-4 md:px-8 md:pt-0 md:pb-32 lg:w-fit lg:px-0">
          {[0, 1, 2, 3].map((id) => (
            <Image
              key={id}
              src="/assets/landing/quote-card.png"
              width={1588}
              height={1245}
              alt=""
              className={`h-60 w-auto rounded-xl shadow-xl md:h-66 lg:h-78 ${id === 3 ? 'hidden md:block' : ''} ${id % 2 === 1 ? 'md:translate-y-7' : 'md:-translate-y-25'}`}
            />
          ))}
        </div>
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
