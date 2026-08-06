import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { Relation } from './types'

export async function getRelation(relationId: number): Promise<Relation | null> {
  if (!Number.isInteger(relationId)) {
    return null
  }
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relation = await awaitRequest<Relation | undefined>(relationStore.get(relationId))
  return relation ?? null
}
