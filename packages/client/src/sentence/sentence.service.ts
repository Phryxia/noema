import { RECENT_SENTENCES_STORE, SENTENCES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import { RECENT_SENTENCES_SIZE } from './consts'
import { addSentences } from './sentenceTx'
import type { RecentSentence, Sentence } from './types'

export async function createSentence(value: string, source: string): Promise<number> {
  const db = await openNoemaDB()
  const transaction = db.transaction([SENTENCES_STORE, RECENT_SENTENCES_STORE], 'readwrite')
  const [sentenceId] = await addSentences(transaction, [value], source, new Date())
  await awaitTransaction(transaction)
  recordCreation(db, 'sentenceCount')
  return sentenceId
}

export async function updateSentence(
  sentenceId: number,
  value: string,
  source: string,
): Promise<void> {
  if (!value) {
    throw new Error('빈 문자열은 문장이 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction([SENTENCES_STORE, RECENT_SENTENCES_STORE], 'readwrite')
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)

  const sentence = await awaitRequest<Sentence | undefined>(sentenceStore.get(sentenceId))
  if (!sentence) {
    await awaitTransaction(transaction)
    return
  }
  sentence.value = value
  sentence.modifiedAt = new Date()
  if (source) {
    sentence.source = source
  } else {
    delete sentence.source
  }
  sentenceStore.put(sentence)

  const recentStore = transaction.objectStore(RECENT_SENTENCES_STORE)
  await forEachRecentSlot(recentStore, sentenceId, (slot, index) =>
    recentStore.put({ sentenceId, value, createdAt: slot.createdAt }, index),
  )

  await awaitTransaction(transaction)
}

export async function deleteSentence(sentenceId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction([SENTENCES_STORE, RECENT_SENTENCES_STORE], 'readwrite')
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const isExisting = !!(await awaitRequest<number>(sentenceStore.count(sentenceId)))
  sentenceStore.delete(sentenceId)

  const recentStore = transaction.objectStore(RECENT_SENTENCES_STORE)
  await forEachRecentSlot(recentStore, sentenceId, (_slot, index) =>
    recentStore.put(null, index),
  )

  await awaitTransaction(transaction)
  if (isExisting) {
    recordDeletion(db, 'sentenceCount')
  }
}

export async function getSentence(sentenceId: number): Promise<Sentence | null> {
  if (!Number.isInteger(sentenceId)) {
    return null
  }
  const db = await openNoemaDB()
  const sentenceStore = db.transaction(SENTENCES_STORE).objectStore(SENTENCES_STORE)
  const sentence = await awaitRequest<Sentence | undefined>(sentenceStore.get(sentenceId))
  return sentence ?? null
}

export async function getRecentSentences(): Promise<RecentSentence[]> {
  const db = await openNoemaDB()
  const recentStore = db.transaction(RECENT_SENTENCES_STORE).objectStore(RECENT_SENTENCES_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))

  const result: RecentSentence[] = []
  for (let offset = 1; offset <= RECENT_SENTENCES_SIZE; offset += 1) {
    const slot = await awaitRequest<RecentSentence | null | undefined>(
      recentStore.get((next - offset + RECENT_SENTENCES_SIZE) % RECENT_SENTENCES_SIZE),
    )
    if (slot) {
      result.push(slot)
    }
  }
  return result
}

async function forEachRecentSlot(
  recentStore: IDBObjectStore,
  sentenceId: number,
  handle: (slot: RecentSentence, index: number) => void,
): Promise<void> {
  for (let index = 0; index < RECENT_SENTENCES_SIZE; index += 1) {
    const slot = await awaitRequest<RecentSentence | null | undefined>(recentStore.get(index))
    if (slot?.sentenceId === sentenceId) {
      handle(slot, index)
    }
  }
}
