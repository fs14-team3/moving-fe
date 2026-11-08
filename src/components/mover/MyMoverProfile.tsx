'use client'

import Badge from '@/components/common/Badge'
import Button from '@/components/common/button/Button'
import ReviewSection from '@/components/mover/review/ReviewSection'
import { getServiceTypeLabel } from '@/constants/services'
import { useMyMover } from '@/features/movers/hooks/useMyMover'
import { Heart, LoaderCircle, PencilLine } from 'lucide-react'
import Image from 'next/image'

export default function MyMoverProfile() {
  const { mover, isPending, isError, refetch, isRefetching } = useMyMover()

  if (isPending) {
    return (
      <div
        role="status"
        className="flex min-h-page flex-col items-center justify-center gap-4"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-primary-400"
        />
        <span className="text-base text-gray-400 md:text-lg">
          내 프로필을 불러오고 있습니다.
        </span>
      </div>
    )
  }

  if (isError && !mover) {
    return (
      <div className="flex min-h-page flex-col items-center justify-center gap-4">
        <p role="alert" className="text-base text-gray-400 md:text-lg">
          내 프로필을 불러오지 못했습니다.
        </p>
        <Button
          variant="outlined"
          disabled={isRefetching}
          onClick={() => refetch()}
          className="h-10 w-auto rounded-xl px-5 text-sm lg:h-10 lg:w-auto"
        >
          다시 시도
        </Button>
      </div>
    )
  }

  if (!mover) return null

  const imageUrl = mover.imageUrl || '/assets/images/profile.png'
  const nickname = mover.nickname?.trim() || '익명'
  const favoriteCount = mover.favoriteCount ?? '-'
  const intro = mover.intro?.trim() || '등록된 소개가 없습니다.'
  const description =
    mover.description?.trim() || '등록된 상세 설명이 없습니다.'
  const rating = mover.averageRating.toFixed(1)
  const careerYears =
    mover.careerYears !== null ? `${mover.careerYears}년` : '-'
  const serviceTypes = mover.serviceTypes ?? []
  const regions = mover.regions ?? []

  const stats = [
    { label: '진행', value: `${mover.confirmedCount}건` },
    { label: '리뷰', value: rating },
    { label: '총 경력', value: careerYears },
  ]

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1344px] px-[30px] py-4 md:px-18 lg:py-8">
        <h1 className="text-lg leading-6 font-semibold text-black-500 lg:text-2xl lg:leading-8">
          마이페이지
        </h1>
      </div>

      <div
        aria-hidden="true"
        className="h-[122px] bg-[url('/assets/images/mover_detail_banner.png')] bg-cover bg-center bg-no-repeat md:h-[157px] lg:h-[180px]"
      />

      <div className="mx-auto max-w-[1344px] px-5 pt-5.5 pb-10 md:px-18 md:pt-11 lg:grid lg:grid-cols-[minmax(0,1fr)_282px] lg:gap-x-24">
        <section aria-label="내 프로필">
          <div className="flex items-end gap-3">
            <Image
              src={imageUrl}
              width={80}
              height={85}
              alt={`${nickname} 기사님 프로필`}
              className="h-16 w-15 rounded-xl object-cover md:h-[85px] md:w-20"
            />
            <div className="flex flex-col gap-0.5 pb-0.5 md:gap-2.5">
              <div className="flex items-center gap-0.5">
                <Image
                  src="/assets/icons/mover_badge.png"
                  width={20}
                  height={23}
                  alt=""
                  className="h-[22px] w-[19px] md:h-[31px] md:w-[27px]"
                />
                <h2 className="text-base leading-6 font-semibold text-black-300 md:text-2xl md:leading-8">
                  {nickname}
                </h2>
              </div>
              <p className="flex items-center gap-1.5 pl-0.5 text-sm leading-5 text-gray-500 md:gap-2 md:text-lg md:leading-6">
                <Heart
                  aria-hidden="true"
                  className="size-4 fill-black-400 text-black-400"
                />
                <span className="sr-only">찜</span>
                {favoriteCount}
              </p>
            </div>
          </div>

          <p className="mt-4 text-base leading-6 font-semibold text-black-300 md:text-lg md:leading-7">
            {intro}
          </p>
          <p className="mt-3 text-sm leading-6 whitespace-pre-line text-gray-500 md:text-base md:leading-[26px]">
            {description}
          </p>
        </section>

        <div className="mt-7 flex flex-col gap-3 md:mt-8 md:flex-row-reverse md:gap-4 lg:mt-0 lg:flex-col lg:self-end">
          <Button
            href="/mover/profile/edit"
            icon={
              <PencilLine
                aria-hidden="true"
                className="size-4 fill-current lg:size-5"
              />
            }
            className="w-full md:h-16 md:flex-1 lg:h-16 lg:w-full lg:flex-none"
          >
            내 프로필 수정
          </Button>
          <Button
            href="/mover/basic-info/edit"
            variant="outlined"
            icon={
              <PencilLine
                aria-hidden="true"
                className="size-4 fill-current lg:size-5"
              />
            }
            className="w-full border-gray-400 text-gray-400 hover:bg-gray-100/50 active:bg-gray-100 md:h-16 md:flex-1 lg:h-16 lg:w-full lg:flex-none"
          >
            기본정보 수정
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-6 border-t border-line-100 pt-6 md:mt-8 md:gap-10 md:pt-8 lg:col-start-1">
          <section>
            <h2 className="mb-2 text-base leading-6 font-semibold text-black-400 md:mb-4 md:text-xl md:leading-8">
              활동 현황
            </h2>
            <dl className="flex h-[105px] items-center justify-center rounded-2xl border border-line-100 bg-background-100 md:h-30">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex w-25 flex-col items-center gap-0.5 md:w-28 md:gap-1 lg:w-56"
                >
                  <dt className="text-sm leading-5 text-black-300 md:text-base md:leading-6">
                    {label}
                  </dt>
                  <dd className="text-base leading-6 font-bold text-primary-400 md:text-xl md:leading-8">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="mb-2 text-base leading-6 font-semibold text-black-400 md:mb-4 md:text-xl md:leading-8">
              제공 서비스
            </h2>
            <div className="flex items-center gap-2">
              {serviceTypes.map((serviceType) => (
                <Badge
                  key={serviceType}
                  className="rounded-[100px] border border-primary-400 px-3 py-[5px] leading-6 font-medium md:px-5 md:py-[10px] md:text-lg"
                >
                  {getServiceTypeLabel(serviceType)}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-base leading-6 font-semibold text-black-400 md:mb-4 md:text-xl md:leading-8">
              서비스 가능 지역
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {regions.map((region) => (
                <Badge
                  key={region}
                  className="rounded-[100px] border border-gray-200 bg-background-100 px-3 py-[5px] leading-6 font-medium text-black-400 md:px-5 md:py-[10px] md:text-lg"
                >
                  {region}
                </Badge>
              ))}
            </div>
          </section>

          <ReviewSection
            mover={mover}
            showEmptyMessage={false}
            className="border-t border-line-100 pt-6 md:pt-10"
          />
        </div>
      </div>
    </div>
  )
}
