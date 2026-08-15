import { RELATIONS_STORE } from '../db/consts'
import type { RecentSource } from '../recent/types'
import type { Relation, WordRelation } from '../relation/types'
import { hydrateQnaEntries } from './hydrateQnaEntries'
import type { QnaEntry } from './types'

export const QNA_PAGES_QUERY_KEY = 'qnaPages'

export const QnaRelationSource: RecentSource<QnaEntry, WordRelation> = {
  storeName: RELATIONS_STORE,
  toEntry: toWordRelation,
  hydrate: hydrateQnaEntries,
}

function toWordRelation(id: number, stored: unknown): WordRelation | null {
  const relation: Relation = { ...(stored as Relation), relationId: id }
  if (relation.type === 'DocumentToSentence') {
    return null
  }
  return relation
}
