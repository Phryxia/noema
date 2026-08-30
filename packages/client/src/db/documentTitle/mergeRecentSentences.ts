import { RECENT_SENTENCES_SIZE } from '../consts'
import type { StoredSentence } from './checkIsStoredSentence'

export interface RecentSentenceQueue {
  slots: (StoredSentence | null)[]
  next: number
}

export function mergeRecentSentences(
  existing: StoredSentence[],
  added: StoredSentence[],
  toSortKey: (createdAt: unknown) => string,
  size: number = RECENT_SENTENCES_SIZE,
): RecentSentenceQueue {
  const addedIds = new Set(added.map((sentence) => sentence.sentenceId))
  const kept = existing.filter((sentence) => !addedIds.has(sentence.sentenceId))
  const sortedAdded = added.slice().sort((a, b) => compareSentences(a, b, toSortKey))
  const latest = [...kept, ...sortedAdded].slice(-size)
  const slots: (StoredSentence | null)[] = Array.from(
    { length: size },
    (_, index) => latest[index] ?? null,
  )
  return { slots, next: latest.length % size }
}

export function readQueueOrder<T>(slots: (T | null | undefined)[], next: number): T[] {
  const size = slots.length
  const ordered: T[] = []
  for (let offset = 0; offset < size; offset += 1) {
    const slot = slots[(next + offset) % size]
    if (slot) {
      ordered.push(slot)
    }
  }
  return ordered
}

function compareSentences(
  a: StoredSentence,
  b: StoredSentence,
  toSortKey: (createdAt: unknown) => string,
): number {
  const keyA = toSortKey(a.createdAt)
  const keyB = toSortKey(b.createdAt)
  if (keyA !== keyB) {
    return keyA < keyB ? -1 : 1
  }
  return a.sentenceId - b.sentenceId
}

export function toDateSortKey(createdAt: unknown): string {
  return createdAt instanceof Date ? createdAt.toISOString() : ''
}
