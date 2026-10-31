'use client'

import Badge from '@/components/common/Badge'
import Button from '@/components/common/button/Button'
import IconButton from '@/components/common/button/IconButton'
import KakaoScript from '@/components/mover/KakaoScript'
import ReviewSection from '@/components/mover/review/ReviewSection'
import ServiceTypeChip from '@/components/mover/ServiceTypeChip'
import { getServiceTypeLabel } from '@/constants/services'
import { TOAST_MESSAGES } from '@/constants/ToastMessage'
import { useMover } from '@/features/movers/hooks/useMover'
import { isApiError } from '@/lib/api-error'
import { Heart, LoaderCircle, Star } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function MoverDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { mover, error, isPending, isError, refetch, isRefetching } =
    useMover(id)

  const isNotFound =
    isApiError(error) && (error.status === 400 || error.status === 404)

  useEffect(() => {
    if (!isNotFound) return

    toast.error(TOAST_MESSAGES.mover.notFound, {
      id: 'mover-not-found',
    })
    router.replace('/movers')
  }, [isNotFound, router])

  if (isPending) {
    return (
      <main
        role="status"
        className="flex min-h-page flex-col items-center justify-center gap-4"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-primary-400"
        />
        <span className="text-base text-gray-400 md:text-lg">
          기사님 정보를 불러오고 있습니다.
        </span>
      </main>
    )
  }

  if (isNotFound) return null

  if (isError) {
    return (
      <main className="flex min-h-page flex-col items-center justify-center gap-4">
        <p role="alert" className="text-base text-gray-400 md:text-lg">
          기사님 정보를 불러오지 못했습니다.
        </p>
        <Button
          variant="outlined"
          disabled={isRefetching}
          onClick={() => refetch()}
          className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto"
        >
          다시 시도
        </Button>
      </main>
    )
  }
  if (!mover) return null

  const imageUrl = mover.imageUrl || '/assets/images/profile.png'
  const serviceTypes = mover.serviceTypes ?? []
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const nickname = mover.nickname?.trim() || '익명'
  const favoriteCount = mover.favoriteCount ?? '-'
  const description =
    mover.description?.trim() || '등록된 상세 설명이 없습니다.'
  const rating = mover.averageRating.toFixed(1)
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'

  const regions = mover.regions ?? []

  async function handleCopyLink() {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      toast.success(TOAST_MESSAGES.common.linkCopied)
    } catch {
      toast.error(TOAST_MESSAGES.common.linkCopyFailed)
    }
  }
  function handleKakaoShare() {
    const Kakao = window.Kakao

    if (!Kakao?.isInitialized()) {
      toast.error(TOAST_MESSAGES.common.shareFailed)
      return
    }

    const currentUrl = window.location.href
    const shareImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${window.location.origin}${imageUrl}`

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${nickname} 기사님 | 무빙`,
        description,
        imageUrl: shareImageUrl,
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: '기사님 상세 보기',
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
      ],
    })
  }
  function handleFacebookShare() {
    const shareUrl = encodeURIComponent(window.location.href)

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      '_blank',
      'noopener,noreferrer,width=600,height=400',
    )
  }

  return (
    <>
      <KakaoScript />

      <main className="bg-gray-50">
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
                  <ServiceTypeChip
                    serviceType={serviceType}
                    key={serviceType}
                  />
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
                  className="flex cursor-pointer items-center gap-[6px]"
                >
                  <span className="text-sm leading-6 font-medium text-gray-500 md:text-lg">
                    {favoriteCount}
                  </span>
                  <Heart
                    aria-hidden="true"
                    className={
                      mover.isFavorite
                        ? 'size-4 fill-red-500 text-red-500'
                        : 'size-4 fill-transparent text-gray-300'
                    }
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
                  {mover.confirmedCount}건
                </dd>
              </div>

              <div className="flex flex-col items-center md:gap-1">
                <dt className="text-xs leading-5 font-normal text-gray-500 md:text-base md:leading-6">
                  리뷰
                </dt>
                <dd className="flex items-center gap-[2px] text-base leading-6 font-semibold md:gap-[6px] md:text-xl md:font-bold">
                  <Star
                    aria-hidden="true"
                    className="size-5 fill-yellow-400 text-yellow-400"
                  />
                  <span>{rating}</span>
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
                  <Badge
                    key={serviceType}
                    className="rounded-[100px] border border-primary-400 px-3 py-[6px] leading-6 font-medium md:px-5 md:py-[10px] md:text-lg"
                  >
                    {getServiceTypeLabel(serviceType)}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="lg:pb-10">
              <h2 className="mb-2 text-base leading-8 font-semibold text-black-400 md:mb-4 md:text-xl">
                서비스 가능 지역
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {regions.map((region) => (
                  <Badge
                    key={region}
                    className="rounded-[100px] border border-gray-200 bg-background-100 px-3 py-[6px] font-medium text-black-400 md:px-5 md:py-[10px] md:text-lg"
                  >
                    {region}
                  </Badge>
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
                    <Heart
                      aria-hidden="true"
                      className="size-5 fill-black text-black"
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
                <IconButton
                  icon="link"
                  className="cursor-pointer"
                  onClick={handleCopyLink}
                />
                <IconButton
                  icon="kakao"
                  className="cursor-pointer"
                  onClick={handleKakaoShare}
                />
                <IconButton
                  icon="facebook"
                  className="cursor-pointer"
                  onClick={handleFacebookShare}
                />
              </div>
            </section>
          </div>

          <ReviewSection mover={mover} />
        </div>
      </main>
    </>
  )
}
