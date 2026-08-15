import { EXTRACT_SOURCE_PREFIX } from '../d2s/consts'
import { RECENT_SENTENCES_STORE, RELATIONS_STORE, SENTENCES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import type { DocumentToSentenceRelation } from '../relation/types'
import { addSentences } from '../sentence/sentenceTx'
import { recordCreation } from '../statistic/statistic.service'

export async function submitExtraction(documentId: number, values: string[]): Promise<number> {
  const sentences = values.filter((value) => value.trim())
  if (!sentences.length) {
    throw new Error('추출할 문장이 없습니다')
  }
  const createdAt = new Date()
  const source = `${EXTRACT_SOURCE_PREFIX}, did=${documentId}`
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [SENTENCES_STORE, RECENT_SENTENCES_STORE, RELATIONS_STORE],
    'readwrite',
  )
  const sentenceIds = await addSentences(transaction, sentences, source, createdAt)
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  sentenceIds.forEach((sentenceId) => {
    const relation: Omit<DocumentToSentenceRelation, 'relationId'> = {
      type: 'DocumentToSentence',
      documentId,
      sentenceId,
      createdAt,
    }
    relationStore.add(relation)
  })
  await awaitTransaction(transaction)
  recordCreation(db, 'sentenceCount', sentenceIds.length)
  recordCreation(db, 'relationCount', sentenceIds.length)
  return sentenceIds.length
}
