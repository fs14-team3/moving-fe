'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type DropdownProps = {
  placeholder: string
  options: {
    label: string
    value: string
  }[]
  variant: 'service' | 'region' | 'sort'
}

const variantStyles = {
  service: {
    button:
      'w-[106px] h-9 rounded-lg px-[10px] text-sm lg:w-40 lg:h-[50px] lg:text-base lg:px-5 lg:rounded-xl',
    openButton: 'border-primary-400 text-primary-400 bg-primary-100',
    icon: 'size-5',
    menu: 'top-12 w-[106px] rounded-lg border border-line-100 overflow-hidden lg:rounded-xl lg:top-[62px] lg:w-40',
    menuButton: 'w-full h-10 px-[14px] text-sm lg:h-15 lg:text-base lg:px-5',
  },
  region: {
    button:
      'w-[78px] h-9 px-[14px] rounded-lg text-sm lg:w-40 lg:h-[50px] lg:text-base lg:px-6 lg:rounded-xl',
    openButton: 'border-primary-400 text-primary-400 bg-primary-100',
    icon: 'size-5',
    menu: 'w-[150px] h-45 top-12 rounded-lg border border-line-100 grid grid-cols-2 overflow-x-hidden overflow-y-auto lg:rounded-xl lg:top-[62px] lg:w-82 lg:h-80',
    menuButton:
      'w-[75px] h-9 px-[14px] text-sm lg:w-41 lg:h-16 lg:px-6 lg:text-lg',
  },
  sort: {
    button:
      'w-[95px] h-8 rounded-lg px-[10px] text-xs lg:w-[114px] lg:h-10 lg:rounded-xl lg:text-sm lg:font-semibold',
    openButton: 'border-transparent bg-white text-gray-400',
    icon: 'size-[15px] lg:size-5',
    menu: 'top-[38px] w-[95px] overflow-hidden rounded-lg border border-line-100 lg:w-[114px] lg:rounded-xl lg:top-12',
    menuButton: 'w-full h-8 text-xs px-[10px] lg:h-10 lg:text-sm',
  },
}

export default function Dropdown({
  placeholder,
  options,
  variant,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')

  function handleSelect(value: string) {
    setSelectedValue(value)
    setIsOpen(false)
  }

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  )

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center justify-between rounded-lg border font-medium ${variantStyles[variant].button} ${isOpen ? variantStyles[variant].openButton : 'border-line-200 bg-white text-black-400 lg:border-gray-300'}`}
      >
        <p>{selectedOption?.label || placeholder}</p>
        <ChevronDown
          className={`${variantStyles[variant].icon} transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          className={`absolute z-10 shadow-lg ${variantStyles[variant].menu}`}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer bg-white text-left font-medium text-black-400 hover:bg-gray-100 ${variantStyles[variant].menuButton}`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
