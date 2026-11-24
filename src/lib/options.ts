export type Option<T> = { value: T; label: string }

export function getOptionLabel<T>(options: Option<T>[], value: T) {
  return (
    options.find((option) => option.value === value)?.label ?? String(value)
  )
}
