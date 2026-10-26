import type { ServiceType } from '@/features/movers/mocks/movers'
import { cn } from '@/lib/cn'
import Image from 'next/image'

type ServiceTypeChipProps = {
  serviceType: ServiceType
  size?: 'responsive' | 'small'
}

const SERVICE_TYPE_CONFIG: Record<
  ServiceType,
  { label: string; imageSrc: string }
> = {
  SMALL: {
    label: '소형이사',
    imageSrc: '/assets/icons/box.png',
  },
  HOME: {
    label: '가정이사',
    imageSrc: '/assets/icons/home.png',
  },
  OFFICE: {
    label: '사무실이사',
    imageSrc: '/assets/icons/office.png',
  },
}

export default function ServiceTypeChip({
  serviceType,
  size = 'responsive',
}: ServiceTypeChipProps) {
  const { label, imageSrc } = SERVICE_TYPE_CONFIG[serviceType]
  const isResponsive = size === 'responsive'

  return (
    <div
      className={cn(
        'flex w-fit items-center gap-[2px] rounded-sm bg-primary-100 px-1 py-[2px]',
        isResponsive && 'md:gap-1',
      )}
    >
      <Image src={imageSrc} width={20} height={20} alt="" />
      <span
        className={cn(
          'text-xs leading-5 font-semibold text-primary-500',
          isResponsive && 'md:text-sm md:leading-6',
        )}
      >
        {label}
      </span>
    </div>
  )
}
