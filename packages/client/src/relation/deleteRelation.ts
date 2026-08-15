import { QUESTIONS_STORE, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import { recordDeletion } from '../statistic/statistic.service'
import { getRelation } from './getRelation'
import type { Relation } from './types'

export async function deleteRelation(relationId: number): Promise<void> {
  const relation = await getRelation(relationId)
  if (!relation) {
    return
  }

  const db = await openNoemaDB()
  const transaction = db.transaction(getStoreNames(relation), 'readwrite')
  transaction.objectStore(RELATIONS_STORE).delete(relationId)
  if (relation.type !== 'DocumentToSentence') {
    transaction.objectStore(QUESTIONS_STORE).delete(relation.questionId)
  }

  await awaitTransaction(transaction)
  recordDeletion(db, 'relationCount')
}

function getStoreNames(relation: Relation): string[] {
  if (relation.type === 'DocumentToSentence') {
    return [RELATIONS_STORE]
  }
  return [RELATIONS_STORE, QUESTIONS_STORE]
}
