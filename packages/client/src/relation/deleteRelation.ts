import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import { recordDeletion } from '../statistic/statistic.service'
import { getRelation } from './getRelation'

export async function deleteRelation(relationId: number): Promise<void> {
  const relation = await getRelation(relationId)
  if (!relation) {
    return
  }

  const db = await openNoemaDB()
  const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
  transaction.objectStore(RELATIONS_STORE).delete(relationId)
  await awaitTransaction(transaction)
  recordDeletion(db, 'relationCount')
}
