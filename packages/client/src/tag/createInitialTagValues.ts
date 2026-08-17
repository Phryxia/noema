import { normalizeTagValues } from './normalizeTagValues'
import type { TagEntry } from './types'

export function createInitialTagValues(entries: TagEntry[]): string[] {
  return normalizeTagValues(entries.map((entry) => entry.word.value))
}
