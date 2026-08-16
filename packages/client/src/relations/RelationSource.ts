import { hydrateRelationEntries } from './hydrateRelationEntries'
import type { RelationEntry } from './types'
import { RELATIONS_STORE } from '../db/consts'
import type { RecentSource } from '../recent/types'
import type { Relation } from '../relation/types'

export const RelationSource: RecentSource<RelationEntry, Relation> = {
  storeName: RELATIONS_STORE,
  toEntry: toRelation,
  hydrate: hydrateRelationEntries,
}

function toRelation(id: number, stored: unknown): Relation {
  return { ...(stored as Relation), relationId: id }
}
