import type { DocumentTitleRelation, Relation } from '../relation/types'

export function checkIsDocumentTitleRelation(
  relation: Relation,
): relation is DocumentTitleRelation {
  return relation.type === 'DocumentTitle'
}
