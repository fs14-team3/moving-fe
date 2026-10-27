import type { ServiceType } from '@/features/movers/types'
import { cn } from '@/lib/cn'
import Image from 'next/image'
import Chip from '../common/Chip'

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
    <Chip
      icon={<Image src={imageSrc} width={20} height={20} alt="" />}
      className={cn(
        'gap-[2px] rounded-sm px-1 py-[2px] text-xs leading-5 whitespace-nowrap text-primary-500',
        isResponsive
          ? 'md:gap-1 md:px-1 md:text-sm md:leading-6'
          : 'md:gap-[2px] md:px-1 md:text-xs md:leading-5',
      )}
    >
      {label}
    </Chip>
  )
}
