import type { components } from '@/lib/api-schema'

export type ServiceType = components['schemas']['ServiceType']

export const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'SMALL', label: '소형이사' },
  { value: 'HOME', label: '가정이사' },
  { value: 'OFFICE', label: '사무실이사' },
]

export function getServiceTypeLabel(serviceType: ServiceType) {
  return (
    SERVICE_TYPE_OPTIONS.find((option) => option.value === serviceType)
      ?.label ?? serviceType
  )
}
