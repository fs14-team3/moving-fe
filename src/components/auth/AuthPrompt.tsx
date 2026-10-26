import Link from 'next/link'
import { cn } from '@/lib/cn'

type AuthPromptProps = {
  question: string
  linkLabel: string
  href: string
  className?: string
}

export default function AuthPrompt({
  question,
  linkLabel,
  href,
  className,
}: AuthPromptProps) {
  return (
    <p className={cn('text-xs text-black-200 md:text-xl/8', className)}>
      {question}{' '}
      <Link
        href={href}
        className="font-semibold text-primary-400 underline underline-offset-2"
      >
        {linkLabel}
      </Link>
    </p>
  )
}
