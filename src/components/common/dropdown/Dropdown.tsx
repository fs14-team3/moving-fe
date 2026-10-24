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
    button: 'w-[106px] h-9 rounded-lg px-[10px] text-sm',
    openButton: 'border-primary-400 text-primary-400 bg-primary-100',
    icon: 'size-5',
    menu: 'top-12 w-[106px] rounded-lg overflow-hidden',
    menuButton: 'w-full h-10 px-[14px] text-sm',
  },
  region: {
    button: 'w-[78px] h-9 px-[14px] rounded-lg text-sm',
    openButton: 'border-primary-400 text-primary-400 bg-primary-100',
    icon: 'size-5',
    menu: 'w-[150px] h-45 top-12 rounded-lg grid grid-cols-2 overflow-x-hidden overflow-y-auto',
    menuButton: 'w-[75px] h-9 px-[14px] text-sm',
  },
  sort: {
    button: 'w-[95px] h-8 px-[10px] text-xs',
    openButton: 'border-transparent bg-white text-gray-400',
    icon: 'size-[15px]',
    menu: 'top-[38px] w-[95px] overflow-hidden rounded-lg',
    menuButton: 'w-full h-8 text-xs px-[10px]',
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
        className={`flex cursor-pointer items-center justify-between rounded-lg border font-medium ${variantStyles[variant].button} ${isOpen ? variantStyles[variant].openButton : 'border-transparent bg-white text-black-400'}`}
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
