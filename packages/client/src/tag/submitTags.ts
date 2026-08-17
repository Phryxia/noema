import { normalizeTagValues } from './normalizeTagValues'
import type { TagEntry, TagResult, TagTarget } from './types'
import {
  RECENT_WORDS_STORE,
  RELATIONS_STORE,
  WORD_META_STORE,
  WORD_NODES_STORE,
} from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import type { DocumentTagRelation, SentenceTagRelation } from '../relation/types'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import { getErrorMessage } from '../utils/getErrorMessage'
import { addWord } from '../word/wordTx'

type NewTagRelation =
  Omit<SentenceTagRelation, 'relationId'> | Omit<DocumentTagRelation, 'relationId'>

export async function submitTags(
  target: TagTarget,
  previous: TagEntry[],
  values: string[],
): Promise<TagResult[]> {
  const next = normalizeTagValues(values)
  const previousValues = new Set(previous.map((entry) => entry.word.value))
  const nextValues = new Set(next)
  const added = next.filter((value) => !previousValues.has(value))
  const removed = previous.filter((entry) => !nextValues.has(entry.word.value))
  if (!added.length && !removed.length) {
    return []
  }

  const createdAt = new Date()
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE, RELATIONS_STORE],
    'readwrite',
  )
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  const results: TagResult[] = []
  let createdWordCount = 0
  let addedCount = 0

  for (const value of added) {
    try {
      const { nodeId, isCreated } = await addWord(transaction, value, createdAt)
      relationStore.add(createTagRelation(target, nodeId, createdAt))
      addedCount += 1
      if (isCreated) {
        createdWordCount += 1
      }
      results.push({ value, outcome: { kind: 'added' } })
    } catch (error) {
      results.push({ value, outcome: { kind: 'failure', reason: getErrorMessage(error) } })
    }
  }
  for (const entry of removed) {
    relationStore.delete(entry.id)
    results.push({ value: entry.word.value, outcome: { kind: 'removed' } })
  }

  await awaitTransaction(transaction)
  if (createdWordCount) {
    recordCreation(db, 'wordCount', createdWordCount)
  }
  if (addedCount) {
    recordCreation(db, 'relationCount', addedCount)
  }
  if (removed.length) {
    recordDeletion(db, 'relationCount', removed.length)
  }
  return results
}

function createTagRelation(target: TagTarget, wordId: number, createdAt: Date): NewTagRelation {
  if (target.type === 'sentence') {
    return { type: 'Tag', sentenceId: target.id, wordId, createdAt }
  }
  return { type: 'Tag', documentId: target.id, wordId, createdAt }
}
