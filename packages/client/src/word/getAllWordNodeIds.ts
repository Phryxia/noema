import { CREATED_AT_INDEX, WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'

export async function getAllWordNodeIds(): Promise<number[]> {
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const keys = await awaitRequest(nodeStore.index(CREATED_AT_INDEX).getAllKeys())
  return keys as number[]
}
