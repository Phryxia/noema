import { CREATED_AT_INDEX, WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'

export async function getWordCount(): Promise<number> {
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  return awaitRequest<number>(nodeStore.index(CREATED_AT_INDEX).count())
}
