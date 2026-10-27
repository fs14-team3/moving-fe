import Button from '@/components/common/button/Button'
import IconButton from '@/components/common/button/IconButton'
import Chip from '@/components/common/Chip'
import ServiceTypeChip from '@/components/mover/ServiceTypeChip'
import { MOCK_MOVER_DETAILS } from '@/features/movers/mocks/movers'
import Image from 'next/image'
import { notFound } from 'next/navigation'

type MoverDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function MoverDetailPage({
  params,
}: MoverDetailPageProps) {
  const { id } = await params
  const mover = MOCK_MOVER_DETAILS.find((mover) => mover.id === id)

  if (!mover) {
    notFound()
  }

  const nickname = mover.nickname?.trim() || '익명'
  const imageUrl = mover.imageUrl || '/assets/images/profile.png'
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const description =
    mover.description?.trim() || '등록된 상세 설명이 없습니다.'
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'
  const serviceTypes = mover.serviceTypes ?? []
  const regions = mover.regions ?? []

  return (
    <main>
      <header className="relative">
        <div
          aria-hidden="true"
          className="h-[122px] w-full bg-[url('/assets/images/mover_detail_banner.png')] bg-cover bg-center bg-no-repeat md:h-[157px] lg:h-[225px]"
        />
        <div className="absolute inset-x-0 top-0 mx-auto h-full max-w-[1354px]">
          <Image
            src={imageUrl}
            width={60}
            height={64}
            alt={`${nickname} 기사님 프로필`}
            className="absolute top-20 left-9 h-16 w-15 rounded-xl object-cover md:top-20 md:left-18 md:h-[106px] md:w-25 md:rounded-2xl lg:top-[122px] lg:left-18 lg:h-[137px] lg:w-[129px]"
          />
        </div>
      </header>

      <div className="px-5 pt-[35px] pb-[110px] md:px-18 md:pt-[46px] lg:mx-auto lg:grid lg:max-w-[1354px] lg:grid-cols-[minmax(0,766px)_328px] lg:gap-x-29 lg:px-18 lg:pb-0">
        <article className="flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex gap-2 md:translate-y-2">
              {serviceTypes.map((serviceType) => (
                <ServiceTypeChip serviceType={serviceType} key={serviceType} />
              ))}
            </div>

            <p className="text-lg leading-6 font-semibold text-black-300 md:text-2xl md:leading-8">
              {intro}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/icons/mover_badge.png"
                  width={20}
                  height={23}
                  alt=""
                />
                <h1 className="text-base leading-6 font-semibold md:text-lg">
                  {nickname} 기사님
                </h1>
              </div>

              <button
                type="button"
                aria-label={mover.isFavorite ? '찜 해제' : '찜하기'}
                className="flex cursor-pointer items-center gap-1"
              >
                <span className="text-sm leading-6 font-medium text-gray-500 md:text-lg">
                  {mover.favoriteCount}
                </span>
                <Image
                  src={
                    mover.isFavorite
                      ? '/assets/icons/like_active.png'
                      : '/assets/icons/like_default.png'
                  }
                  width={24}
                  height={24}
                  alt=""
                />
              </button>
            </div>

            <p className="text-sm leading-6 font-normal text-gray-500 md:text-base">
              {description}
            </p>
          </div>

          <dl
            aria-label="기사님 활동 정보"
            className="grid h-[95px] grid-cols-3 items-center rounded-xl border border-line-200 bg-white px-10 text-center md:h-30 md:px-25"
          >
            <div className="flex flex-col items-center md:gap-1">
              <dt className="text-xs leading-5 font-normal text-gray-500 md:text-base md:leading-6">
                진행
              </dt>
              <dd className="text-base leading-6 font-semibold md:text-xl md:font-bold">
                {mover.confirmedCount}
              </dd>
            </div>

            <div className="flex flex-col items-center md:gap-1">
              <dt className="text-xs leading-5 font-normal text-gray-500 md:text-base md:leading-6">
                리뷰
              </dt>
              <dd className="flex items-center gap-[2px] text-base leading-6 font-semibold md:gap-[6px] md:text-xl md:font-bold">
                <Image
                  src="/assets/icons/star.png"
                  width={20}
                  height={20}
                  alt=""
                />
                <span>{mover.averageRating}</span>
                <span className="text-sm leading-6 font-medium text-gray-400 md:text-base">
                  ({mover.reviewCount})
                </span>
              </dd>
            </div>

            <div className="flex flex-col items-center md:gap-1">
              <dt className="text-xs leading-5 font-normal text-gray-500 md:text-base md:leading-6">
                총 경력
              </dt>
              <dd className="text-base leading-6 font-semibold md:text-xl md:font-bold">
                {careerYears}
              </dd>
            </div>
          </dl>

          <section>
            <h2 className="mb-2 text-base leading-8 font-semibold text-black-400 md:mb-4 md:text-xl">
              제공 서비스
            </h2>
            <div className="flex items-center gap-2">
              {serviceTypes.map((serviceType) => (
                <Chip
                  key={serviceType}
                  className="rounded-[100px] border border-primary-400 px-3 py-[6px] leading-6 font-medium md:px-5 md:py-[10px] md:text-lg"
                >
                  {serviceType}
                </Chip>
              ))}
            </div>
          </section>

          <section className="lg:pb-10">
            <h2 className="mb-2 text-base leading-8 font-semibold text-black-400 md:mb-4 md:text-xl">
              서비스 가능 지역
            </h2>
            <div className="flex items-center gap-2">
              {regions.map((region) => (
                <Chip
                  key={region}
                  className="rounded-[100px] border border-gray-200 bg-background-100 px-3 py-[6px] font-medium text-black-400 md:px-5 md:py-[10px] md:text-lg"
                >
                  {region}
                </Chip>
              ))}
            </div>
          </section>
        </article>

        <div className="lg:col-start-2 lg:row-start-1">
          <aside className="fixed inset-x-0 bottom-0 z-50 bg-background-100 px-6 py-7 lg:static lg:flex lg:flex-col lg:gap-4 lg:bg-transparent lg:p-0">
            <p className="hidden text-lg leading-7 font-semibold lg:block">
              {nickname} 기사님에게 <br />
              지정 견적을 요청해보세요!
            </p>

            <div className="flex w-full items-center gap-2 lg:flex-col lg:gap-4">
              <IconButton
                icon="like"
                aria-label={mover.isFavorite ? '찜 해제' : '찜하기'}
                className="size-[54px] lg:hidden"
              />
              <Button className="w-auto min-w-0 flex-1 lg:w-full lg:flex-none">
                지정 견적 요청하기
              </Button>
              <Button
                icon={
                  <Image
                    src="/assets/icons/like_black.png"
                    width={54}
                    height={54}
                    alt=""
                    className="lg:size-6"
                  />
                }
                variant="outlined"
                className="hidden border-line-200 text-black lg:flex lg:w-full"
              >
                기사님 찜하기
              </Button>
            </div>
          </aside>

          <section className="my-8 border-y border-line-100 py-8 lg:border-none">
            <h2 className="mb-3 text-base leading-8 font-semibold text-black-400">
              나만 알기에 아쉬운 기사님인가요?
            </h2>
            <div className="flex gap-3">
              <IconButton icon="link" />
              <IconButton icon="kakao" />
              <IconButton icon="facebook" />
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-4 lg:border-t lg:border-line-100 lg:pt-10">
          <h2 className="text-xl leading-8 font-semibold">리뷰</h2>

          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-[18px]">
              <p className="text-4xl font-medium">{mover.averageRating}</p>

              <div>
                <p>별 개수</p>
                <p className="text-sm leading-6 font-normal text-gray-500">
                  {mover.reviewCount}개의 리뷰
                </p>
              </div>
            </div>

            <div>평점에 따른 리뷰 비율</div>
          </div>

          <div className="flex flex-col gap-10">
            <p>리뷰1</p>
            <p>리뷰2</p>
            <p>리뷰3</p>
            <p>리뷰4</p>
            <p>리뷰5</p>
          </div>
        </section>
      </div>
    </main>
  )
}
