import { LoaderCircle } from 'lucide-react'
import type { ReactNode, SubmitEvent } from 'react'
import Button from '@/components/common/button/Button'
import { cn } from '@/lib/cn'

type ProfileFormProps = {
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  className?: string
  submitClassName?: string
  children: ReactNode
}

export default function ProfileForm({
  canSubmit,
  isSubmitting,
  onSubmit,
  className,
  submitClassName,
  children,
}: ProfileFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSubmit && !isSubmitting) onSubmit()
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <fieldset
        disabled={isSubmitting}
        className={cn('min-w-0 *:last:border-b-0 lg:pt-4', className)}
      >
        {children}
      </fieldset>
      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        aria-busy={isSubmitting || undefined}
        icon={
          isSubmitting && (
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin lg:size-6"
            />
          )
        }
        className={cn('mt-2 w-full lg:mt-6 lg:w-full', submitClassName)}
      >
        시작하기
      </Button>
    </form>
  )
}
