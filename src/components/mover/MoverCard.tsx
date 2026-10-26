import type { Mover } from '@/features/movers/mocks/movers'
import Image from 'next/image'
import ServiceTypeChip from './ServiceTypeChip'

type MoverCardProps = {
  mover: Mover
}

export default function MoverCard({ mover }: MoverCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-[2px_2px_10px_0_rgba(220,220,220,0.2),-2px_-2px_10px_0_rgba(220,220,220,0.2)] md:px-7 md:py-6">
      <div className="flex gap-2">
        {mover.serviceTypes.map((serviceType) => (
          <ServiceTypeChip serviceType={serviceType} key={serviceType} />
        ))}
      </div>
      <div className="grid grid-cols-[50px_minmax(0,1fr)] gap-x-2 gap-y-4 md:grid-cols-[134px_minmax(0,1fr)] md:gap-x-5">
        <Image
          src={mover.imageUrl ?? '/assets/images/profile.svg'}
          width={50}
          height={50}
          alt=""
          className="col-start-1 row-start-2 rounded-xl md:row-span-2 md:row-start-1 md:size-[134px]"
        />

        <div className="col-span-2 row-start-1 border-b border-line-100 pb-4 md:col-span-1 md:col-start-2 md:row-start-1 md:border-none md:pb-0">
          <h2 className="leading-6 font-semibold md:text-xl md:leading-8">
            {mover.intro}
          </h2>
          <p className="line-clamp-2 text-xs leading-5 font-medium text-gray-500 md:text-sm md:font-normal">
            {mover.description}
          </p>
        </div>

        <div className="col-start-2 row-start-2 grid grid-cols-2 gap-y-1 md:col-start-2 md:row-start-2">
          <div className="col-start-1 row-start-1 flex items-center gap-1">
            <Image
              src="/assets/icons/mover_badge.png"
              width={24}
              height={24}
              alt=""
            />
            <p className="text-sm leading-6 font-semibold">
              {mover.nickname} 기사님
            </p>
          </div>
          <div className="col-span-2 row-start-2 flex gap-2 md:col-span-1 md:col-start-1">
            <div className="flex items-center gap-[2px]">
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
            <p className="border-x border-line-200 px-2 text-xs leading-5 font-medium">
              <span className="text-gray-400">경력</span> {mover.careerYears}년
            </p>
            <p className="text-xs leading-5 font-medium">
              {mover.confirmedCount}건{' '}
              <span className="text-gray-400">확정</span>
            </p>
          </div>
          <div className="col-start-2 row-start-1 flex items-center justify-self-end md:row-start-2">
            <button type="button" className="cursor-pointer">
              <Image
                src={
                  mover.isFavorite
                    ? '/assets/icons/like_active.png'
                    : '/assets/icons/like_default.png'
                }
                width={24}
                height={24}
                alt={mover.isFavorite ? '좋아요 취소' : '좋아요'}
              />
            </button>
            <p className="text-sm leading-6 font-normal text-gray-500">
              {mover.favoriteCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
