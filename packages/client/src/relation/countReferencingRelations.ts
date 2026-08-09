import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import { CompoundWordIndexNames, NumericWordIndexNames } from './consts'
import type { WordOrSentence } from './types'

export async function countReferencingRelations(ref: WordOrSentence): Promise<number> {
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relationIds = new Set<IDBValidKey>()

  if (ref.type === 'word') {
    for (const indexName of NumericWordIndexNames) {
      await collectRelationIds(relationStore.index(indexName), ref.id, relationIds)
    }
  }
  for (const indexName of CompoundWordIndexNames) {
    await collectRelationIds(relationStore.index(indexName), [ref.type, ref.id], relationIds)
  }
  return relationIds.size
}

async function collectRelationIds(
  index: IDBIndex,
  key: IDBValidKey,
  relationIds: Set<IDBValidKey>,
): Promise<void> {
  const keys = await awaitRequest(index.getAllKeys(key))
  keys.forEach((relationId) => relationIds.add(relationId))
}
