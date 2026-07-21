import { RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { Relation, RelationTarget } from './types'

export async function deleteRelationsReferencing(target: RelationTarget): Promise<void> {
  const db = await openNoemaDB()
  let targets = [target]

  while (targets.length) {
    const transaction = db.transaction(RELATIONS_STORE, 'readwrite')
    const relationStore = transaction.objectStore(RELATIONS_STORE)
    const relations = await awaitRequest<Relation[]>(relationStore.getAll())
    const matched = relations.filter((relation) =>
      targets.some((currentTarget) => checkIsReferencing(relation, currentTarget)),
    )
    matched.forEach((relation) => relationStore.delete(relation.relationId))
    await awaitTransaction(transaction)
    targets = matched.map((relation) => ({ type: 'relation', id: relation.relationId }))
  }
}

function checkIsReferencing(relation: Relation, target: RelationTarget): boolean {
  if (target.type === 'word' && relation.labelNodeId === target.id) {
    return true
  }
  return checkIsSameTarget(relation.from, target) || checkIsSameTarget(relation.to, target)
}

function checkIsSameTarget(a: RelationTarget, b: RelationTarget): boolean {
  return a.type === b.type && a.id === b.id
}
