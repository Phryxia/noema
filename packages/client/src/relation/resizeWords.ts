export function resizeWords(words: string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => words[index] ?? '')
}
