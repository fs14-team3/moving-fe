import type { ReactNode } from 'react'

type ProfileFieldProps = {
  label: string
  htmlFor?: string
  labelId?: string
  required?: boolean
  message?: ReactNode
  children: ReactNode
}

const LABEL = 'text-base font-semibold text-black-300 lg:text-xl'

export default function ProfileField({
  label,
  htmlFor,
  labelId,
  required = false,
  message,
  children,
}: ProfileFieldProps) {
  const labelContent = (
    <>
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-primary-400">
          *
        </span>
      )}
    </>
  )

  return (
    <div className="border-b border-line-100 py-5 lg:py-8">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={LABEL}>
          {labelContent}
        </label>
      ) : (
        <p id={labelId} className={LABEL}>
          {labelContent}
          {required && <span className="sr-only">(필수)</span>}
        </p>
      )}
      {message}
      <div className="mt-4 lg:mt-5">{children}</div>
    </div>
  )
}
