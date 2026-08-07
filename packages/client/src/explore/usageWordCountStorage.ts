import { DEFAULT_USAGE_WORD_COUNT, USAGE_WORD_COUNT_STORAGE_KEY } from './consts'

export function loadUsageWordCount(): number {
  const parsed = Number(localStorage.getItem(USAGE_WORD_COUNT_STORAGE_KEY))
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_USAGE_WORD_COUNT
  }
  return parsed
}

export function saveUsageWordCount(count: number): void {
  localStorage.setItem(USAGE_WORD_COUNT_STORAGE_KEY, String(count))
}
