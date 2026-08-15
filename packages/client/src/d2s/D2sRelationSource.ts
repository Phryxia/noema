import { hydrateD2sEntries } from './hydrateD2sEntries'
import type { D2sEntry } from './types'
import { RELATIONS_STORE } from '../db/consts'
import type { RecentSource } from '../recent/types'
import type { DocumentToSentenceRelation, Relation } from '../relation/types'

export const D2sRelationSource: RecentSource<D2sEntry, DocumentToSentenceRelation> = {
  storeName: RELATIONS_STORE,
  toEntry: toDocumentToSentenceRelation,
  hydrate: hydrateD2sEntries,
}

function toDocumentToSentenceRelation(
  id: number,
  stored: unknown,
): DocumentToSentenceRelation | null {
  const relation: Relation = { ...(stored as Relation), relationId: id }
  if (relation.type !== 'DocumentToSentence') {
    return null
  }
  return relation
}
