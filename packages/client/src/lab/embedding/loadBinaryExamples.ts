import { createExampleFromRelation } from './createBinaryExample'
import type { BinaryExample } from './model/types'
import { CREATED_AT_INDEX, RELATIONS_STORE } from '../../db/consts'
import { openNoemaDB } from '../../db/openNoemaDB'
import { awaitRequest } from '../../db/utils'
import type { Relation } from '../../relation/types'

export async function loadBinaryExamples(): Promise<BinaryExample[]> {
  const db = await openNoemaDB()
  const store = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relations = await awaitRequest<Relation[]>(store.index(CREATED_AT_INDEX).getAll())
  return relations
    .map(createExampleFromRelation)
    .filter((example): example is BinaryExample => !!example)
}
