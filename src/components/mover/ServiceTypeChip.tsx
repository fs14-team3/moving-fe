import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { cn } from '@/lib/cn'
import Image from 'next/image'
import Badge from '../common/Badge'

type ServiceTypeChipProps = {
  serviceType: ServiceType
  size?: 'responsive' | 'small'
}

const SERVICE_TYPE_IMAGE: Record<ServiceType, string> = {
  SMALL: '/assets/icons/box.png',
  HOME: '/assets/icons/home.png',
  OFFICE: '/assets/icons/office.png',
}

export default function ServiceTypeChip({
  serviceType,
  size = 'responsive',
}: ServiceTypeChipProps) {
  const label =
    SERVICE_TYPE_OPTIONS.find((option) => option.value === serviceType)
      ?.label ?? serviceType
  const imageSrc = SERVICE_TYPE_IMAGE[serviceType]
  const isResponsive = size === 'responsive'

  return (
    <Badge
      icon={<Image src={imageSrc} width={20} height={20} alt="" />}
      className={cn(
        'gap-[2px] rounded-sm px-1 py-[2px] text-xs leading-5 whitespace-nowrap text-primary-500',
        isResponsive
          ? 'md:gap-1 md:px-1 md:text-sm md:leading-6'
          : 'md:gap-[2px] md:px-1 md:text-xs md:leading-5',
      )}
    >
      {label}
    </Badge>
  )
}
