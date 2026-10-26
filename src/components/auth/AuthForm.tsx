import { LoaderCircle } from 'lucide-react'
import type { ReactNode, SubmitEvent } from 'react'
import Button from '@/components/common/Button'

type AuthFormProps = {
  submitLabel: string
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  children: ReactNode
}

export default function AuthForm({
  submitLabel,
  canSubmit,
  isSubmitting,
  onSubmit,
  children,
}: AuthFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSubmit && !isSubmitting) onSubmit()
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-10 flex w-[327px] flex-col gap-4 md:mt-12 md:w-140 md:gap-8 lg:w-160"
    >
      {children}
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
        className="mt-4 md:mt-6 md:h-15 md:w-140 md:text-lg"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
