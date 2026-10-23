'use client'

import { useState } from 'react'

type DropdownProps = {
  placeholder: string
  options: {
    label: string
    value: string
  }[]
}

export default function Dropdown({ placeholder, options }: DropdownProps) {
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
    <div>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption?.label || placeholder}
      </button>

      {isOpen && (
        <ul>
          {options.map((option) => (
            <li key={option.value}>
              <button type="button" onClick={() => handleSelect(option.value)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
