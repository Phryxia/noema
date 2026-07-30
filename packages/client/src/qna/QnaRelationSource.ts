import { RELATIONS_STORE } from '../db/consts'
import type { RecentSource } from '../recent/types'
import type { Relation } from '../relation/types'
import { hydrateQnaEntries } from './hydrateQnaEntries'
import type { QnaEntry } from './types'

export const QNA_PAGES_QUERY_KEY = 'qnaPages'

export const QnaRelationSource: RecentSource<QnaEntry, Relation> = {
  storeName: RELATIONS_STORE,
  toEntry: toRelation,
  hydrate: hydrateQnaEntries,
}

function toRelation(id: number, stored: unknown): Relation {
  return { ...(stored as Relation), relationId: id }
}
