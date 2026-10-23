import { twMerge } from 'tailwind-merge'

// 클래스가 겹치면 뒤에 오는 클래스를 남긴다. (예: cn('w-full', 'w-40') → 'w-40')
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(' '))
}
