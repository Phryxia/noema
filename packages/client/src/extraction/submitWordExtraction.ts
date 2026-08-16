import {
  RECENT_WORDS_STORE,
  RELATIONS_STORE,
  WORD_META_STORE,
  WORD_NODES_STORE,
} from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import type { BatchOutcome } from '../relation/batch/types'
import type { SentenceToWordRelation } from '../relation/types'
import { recordCreation } from '../statistic/statistic.service'
import { getErrorMessage } from '../utils/getErrorMessage'
import { addWord } from '../word/wordTx'

export interface WordExtractionResult {
  value: string
  outcome: BatchOutcome
}

export async function submitWordExtraction(
  sentenceId: number,
  values: string[],
): Promise<WordExtractionResult[]> {
  const words = Array.from(new Set(values.filter(Boolean)))
  if (!words.length) {
    throw new Error('추출할 단어가 없습니다')
  }

  const createdAt = new Date()
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE, RELATIONS_STORE],
    'readwrite',
  )
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  const results: WordExtractionResult[] = []
  let createdWordCount = 0
  let relationCount = 0

  for (const value of words) {
    try {
      const { nodeId, isCreated } = await addWord(transaction, value, createdAt)
      const relation: Omit<SentenceToWordRelation, 'relationId'> = {
        type: 'SentenceToWord',
        sentenceId,
        wordId: nodeId,
        createdAt,
      }
      relationStore.add(relation)
      relationCount += 1
      if (isCreated) {
        createdWordCount += 1
      }
      results.push({ value, outcome: { kind: isCreated ? 'success' : 'duplicate' } })
    } catch (error) {
      results.push({ value, outcome: { kind: 'failure', reason: getErrorMessage(error) } })
    }
  }

  await awaitTransaction(transaction)
  if (createdWordCount) {
    recordCreation(db, 'wordCount', createdWordCount)
  }
  recordCreation(db, 'relationCount', relationCount)
  return results
}
