import type { Mover } from '@/features/movers/mocks/movers'
import Image from 'next/image'
import Link from 'next/link'
import ServiceTypeChip from './ServiceTypeChip'

type FavoriteMoverCardProps = {
  mover: Mover
}

export default function FavoriteMoverCard({ mover }: FavoriteMoverCardProps) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[2px_2px_10px_0_rgba(220,220,220,0.2),-2px_-2px_10px_0_rgba(220,220,220,0.2)]">
      <div className="flex gap-2">
        {mover.serviceTypes.map((serviceType) => (
          <ServiceTypeChip
            key={serviceType}
            serviceType={serviceType}
            size="small"
          />
        ))}
      </div>
      <h3 className="line-clamp-1 text-base leading-6 font-semibold">
        {mover.intro}
      </h3>
      <div className="flex gap-2">
        <Image
          src={mover.imageUrl ?? '/assets/images/profile.svg'}
          width={50}
          height={50}
          alt=""
          className="rounded-xl"
        />
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <Image
              src="/assets/icons/mover_badge.png"
              width={20}
              height={20}
              alt=""
            />
            <p className="text-sm leading-6 font-semibold">
              {mover.nickname} 기사님
            </p>
            <button
              type="button"
              aria-label="찜 해제"
              className="relative z-10 cursor-pointer"
            >
              <Image
                src="/assets/icons/like_active.png"
                width={23}
                height={23}
                alt=""
              />
            </button>
          </div>
          <div className="flex items-center gap-[6px]">
            <div className="flex gap-[2px]">
              <Image
                src="/assets/icons/star.png"
                width={20}
                height={20}
                alt=""
              />
              <p className="text-xs leading-5 font-medium">
                {mover.averageRating}
              </p>
              <p className="text-xs leading-5 font-medium text-gray-400">
                ({mover.reviewCount})
              </p>
            </div>
            <p className="relative px-[6px] text-xs leading-5 font-medium before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-line-200 after:absolute after:inset-y-1 after:right-0 after:w-px after:bg-line-200">
              <span className="text-gray-400">경력</span> {mover.careerYears}년
            </p>
            <p className="text-xs leading-5 font-medium">
              {mover.confirmedCount}건{' '}
              <span className="text-gray-400">확정</span>
            </p>
          </div>
        </div>
      </div>
      <Link
        href={`/movers/${mover.id}`}
        aria-label={`${mover.nickname} 기사님 상세 보기`}
        className="absolute inset-0 rounded-2xl"
      />
    </div>
  )
}
