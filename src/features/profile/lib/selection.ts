export function isSameSelection(selected: string[], saved: string[]) {
  return (
    selected.length === saved.length &&
    selected.every((value) => saved.includes(value))
  )
}
