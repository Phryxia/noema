import { RECENT_SENTENCES_SIZE, RECENT_SENTENCES_STORE, SENTENCES_STORE } from '../db/consts'
import { awaitRequest } from '../db/utils'
import type { RecentSentence } from './types'

export async function addSentences(
  transaction: IDBTransaction,
  values: string[],
  source: string,
  createdAt: Date,
): Promise<number[]> {
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const recentStore = transaction.objectStore(RECENT_SENTENCES_STORE)
  let next = await awaitRequest<number>(recentStore.get('next'))
  const sentenceIds: number[] = []

  for (const value of values) {
    if (!value) {
      throw new Error('빈 문자열은 문장이 될 수 없다')
    }
    const sentenceId = (await awaitRequest<IDBValidKey>(
      sentenceStore.add(source ? { value, createdAt, source } : { value, createdAt }),
    )) as number
    const recentSentence: RecentSentence = { sentenceId, value, createdAt }
    recentStore.put(recentSentence, next)
    next = (next + 1) % RECENT_SENTENCES_SIZE
    sentenceIds.push(sentenceId)
  }
  recentStore.put(next, 'next')
  return sentenceIds
}
