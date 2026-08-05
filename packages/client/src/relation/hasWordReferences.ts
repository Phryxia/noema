import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import { CompoundWordIndexNames, NumericWordIndexNames } from './consts'

export async function hasWordReferences(nodeId: number): Promise<boolean> {
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)

  for (const indexName of NumericWordIndexNames) {
    if (await awaitRequest(relationStore.index(indexName).count(nodeId))) {
      return true
    }
  }
  for (const indexName of CompoundWordIndexNames) {
    if (await awaitRequest(relationStore.index(indexName).count(['word', nodeId]))) {
      return true
    }
  }
  return false
}
