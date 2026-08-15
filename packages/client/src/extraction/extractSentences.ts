const LINE_BREAK_PATTERN = /\r\n?/g
const SENTENCE_PATTERN = /.*?(?:[.?!"']+(?:\s+|$)|\n\s*|$)/g

export function extractSentences(text: string): string[] {
  const normalized = text.replace(LINE_BREAK_PATTERN, '\n')
  return (normalized.match(SENTENCE_PATTERN) ?? []).map((line) => line.trim()).filter(Boolean)
}
