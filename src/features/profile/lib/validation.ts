export function getSelectionError(values: string[]) {
  if (values.length === 0) return '1개 이상 선택해 주세요.'
  return undefined
}
