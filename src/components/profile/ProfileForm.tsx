import { LoaderCircle } from 'lucide-react'
import type { ReactNode, SubmitEvent } from 'react'
import Button from '@/components/common/button/Button'
import { cn } from '@/lib/cn'

type ProfileFormProps = {
  submitLabel: string
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onCancel?: () => void
  className?: string
  actionsClassName?: string
  children: ReactNode
}

const ACTION_BUTTON = 'w-full lg:w-auto lg:flex-1'

export default function ProfileForm({
  submitLabel,
  canSubmit,
  isSubmitting,
  onSubmit,
  onCancel,
  className,
  actionsClassName,
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
      <div
        className={cn(
          'mt-2 flex flex-col-reverse gap-2 lg:mt-6 lg:flex-row lg:gap-5',
          actionsClassName,
        )}
      >
        {onCancel && (
          <Button
            variant="outlined"
            done
            disabled={isSubmitting}
            onClick={onCancel}
            className={ACTION_BUTTON}
          >
            취소
          </Button>
        )}
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
          className={ACTION_BUTTON}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
