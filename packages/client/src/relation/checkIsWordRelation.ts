import { NonWordRelationTypes } from './consts'
import type { Relation, WordRelation } from './types'

export function checkIsWordRelation(relation: Relation): relation is WordRelation {
  return !NonWordRelationTypes.has(relation.type)
}
