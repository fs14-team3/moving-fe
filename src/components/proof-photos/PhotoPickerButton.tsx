'use client'

import { ImagePlus } from 'lucide-react'
import { useRef, type ChangeEvent, type ReactNode } from 'react'
import Button from '@/components/common/button/Button'

type PhotoPickerButtonProps = {
  disabled: boolean
  onSelect: (files: File[]) => void
  children: ReactNode
}

export default function PhotoPickerButton({
  disabled,
  onSelect,
  children,
}: PhotoPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function select(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length > 0) onSelect(files)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={select}
      />
      <Button
        variant="outlined"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        icon={<ImagePlus aria-hidden="true" className="size-4" />}
        className="h-10 w-auto gap-1 rounded-xl px-4 text-sm lg:h-11 lg:w-auto lg:text-base"
      >
        {children}
      </Button>
    </>
  )
}
