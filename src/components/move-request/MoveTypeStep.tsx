'use client'

import { SERVICE_TYPE_OPTIONS, type ServiceType } from '@/constants/services'
import { Check, Circle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const MOVE_TYPE_DETAILS: Record<
  ServiceType,
  {
    description: string
    imageSrc: string
  }
> = {
  SMALL: {
    description: '원룸, 투룸, 20평대 미만',
    imageSrc: '/assets/images/moving-box.png',
  },
  HOME: {
    description: '쓰리룸, 20평대 이상',
    imageSrc: '/assets/images/truck.webp',
  },
  OFFICE: {
    description: '사무실, 상업공간',
    imageSrc: '/assets/images/office-building.png',
  },
}

export default function MoveTypeStep() {
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null)

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {SERVICE_TYPE_OPTIONS.map(({ value, label }) => {
        const isSelected = selectedType === value
        const { description, imageSrc } = MOVE_TYPE_DETAILS[value]

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedType(value)}
            className={`relative flex cursor-pointer items-center justify-between rounded-2xl bg-gray-100 p-4 md:h-[222px] md:w-full md:flex-col md:items-start md:gap-3 md:px-4 md:py-5 ${isSelected ? 'border border-primary-400 bg-primary-100' : ''}`}
          >
            <div className="md:flex md:gap-2">
              <div className="absolute top-4 md:static">
                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-full bg-primary-400"
                  >
                    <Check className="size-4 stroke-[3] text-white" />
                  </span>
                ) : (
                  <Circle
                    aria-hidden="true"
                    strokeWidth={1}
                    className="size-6 text-gray-300"
                  />
                )}
              </div>

              <div
                className={`text-left leading-6 ${isSelected ? 'text-primary-400' : ''}`}
              >
                <strong className="text-base font-semibold">{label}</strong>
                <p
                  className={`text-sm font-normal text-gray-500 ${isSelected ? 'text-primary-400' : ''}`}
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-auto flex h-30 items-end justify-end md:w-full">
              <Image
                src={imageSrc}
                width={value === 'HOME' ? 100 : 120}
                height={value === 'HOME' ? 100 : 120}
                alt=""
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
