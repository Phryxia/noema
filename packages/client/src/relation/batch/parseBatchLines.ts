export function parseBatchLines(text: string): string[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  return Array.from(new Set(lines))
}
