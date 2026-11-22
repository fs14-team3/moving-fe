type FieldMessageProps = {
  errorId: string
  error?: string
}

export default function FieldMessage({ errorId, error }: FieldMessageProps) {
  if (!error) return null

  return (
    <p
      id={errorId}
      className="mt-1 pl-2 text-xs font-medium text-red-500 lg:mt-2 lg:text-base"
    >
      {error}
    </p>
  )
}
