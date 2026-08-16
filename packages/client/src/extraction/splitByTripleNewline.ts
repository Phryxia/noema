const SPLIT_SEPARATOR = '\n\n\n'

export function splitByTripleNewline(value: string): string[] | null {
  if (!value.includes(SPLIT_SEPARATOR)) {
    return null
  }
  return value
    .split(SPLIT_SEPARATOR)
    .map((piece) => piece.trim())
    .filter(Boolean)
}
