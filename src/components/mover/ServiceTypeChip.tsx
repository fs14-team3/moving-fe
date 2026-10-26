import type { ServiceType } from '@/features/movers/mocks/movers'
import Image from 'next/image'

type ServiceTypeChipProps = {
  serviceType: ServiceType
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

export default function ServiceTypeChip({ serviceType }: ServiceTypeChipProps) {
  const { label, imageSrc } = SERVICE_TYPE_CONFIG[serviceType]
  return (
    <div className="flex w-fit items-center gap-[2px] rounded-sm bg-primary-100 px-1 py-[2px] md:gap-1">
      <Image src={imageSrc} width={20} height={20} alt="" />
      <span className="text-xs leading-5 font-semibold text-primary-500 md:text-sm md:leading-6">
        {label}
      </span>
    </div>
  )
}
