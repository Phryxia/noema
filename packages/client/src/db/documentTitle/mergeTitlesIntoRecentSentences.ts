import {
  RECENT_SENTENCES_SIZE,
  RECENT_SENTENCES_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../consts'
import { awaitRequest } from '../utils'
import { checkIsStoredSentence } from './checkIsStoredSentence'
import type { StoredSentence } from './checkIsStoredSentence'
import { DOCUMENT_TITLE_RELATION_TYPE } from './consts'
import { mergeRecentSentences, readQueueOrder, toDateSortKey } from './mergeRecentSentences'

export async function mergeTitlesIntoRecentSentences(
  transaction: IDBTransaction,
): Promise<void> {
  const sentenceIds = await readTitleSentenceIds(transaction.objectStore(RELATIONS_STORE))
  if (!sentenceIds.length) {
    return
  }
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const titles: StoredSentence[] = []
  for (const sentenceId of sentenceIds) {
    const sentence: unknown = await awaitRequest(sentenceStore.get(sentenceId))
    if (checkIsStoredSentence(sentence)) {
      titles.push(sentence)
    }
  }
  const recentStore = transaction.objectStore(RECENT_SENTENCES_STORE)
  const existing = await readRecentSentences(recentStore)
  const { slots, next } = mergeRecentSentences(existing, titles, toDateSortKey)
  slots.forEach((slot, index) => recentStore.put(slot, index))
  recentStore.put(next, 'next')
}

function readTitleSentenceIds(relationStore: IDBObjectStore): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const sentenceIds: number[] = []
    const request = relationStore.openCursor()
    request.onerror = (): void => reject(request.error)
    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve(sentenceIds)
        return
      }
      const relation: unknown = cursor.value
      if (checkIsTitleRelation(relation)) {
        sentenceIds.push(relation.sentenceId)
      }
      cursor.continue()
    }
  })
}

function checkIsTitleRelation(value: unknown): value is { sentenceId: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === DOCUMENT_TITLE_RELATION_TYPE &&
    'sentenceId' in value &&
    typeof value.sentenceId === 'number'
  )
}

async function readRecentSentences(recentStore: IDBObjectStore): Promise<StoredSentence[]> {
  const slots: (StoredSentence | null)[] = []
  for (let index = 0; index < RECENT_SENTENCES_SIZE; index += 1) {
    const slot: unknown = await awaitRequest(recentStore.get(index))
    slots.push(checkIsStoredSentence(slot) ? slot : null)
  }
  const next: unknown = await awaitRequest(recentStore.get('next'))
  return readQueueOrder(slots, typeof next === 'number' ? next : 0)
}
