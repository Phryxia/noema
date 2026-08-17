import { hydrateTagEntries } from './hydrateTagEntries'
import type { TagEntry, TagTarget } from './types'
import {
  DOCUMENT_ID_INDEX,
  RELATIONS_STORE,
  SENTENCE_ID_INDEX,
  WORD_ID_INDEX,
} from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { Relation, TagRelation } from '../relation/types'

export async function getTagEntries(target: TagTarget): Promise<TagEntry[]> {
  return hydrateTagEntries(await getTagRelations(target))
}

export function getTagRelations(target: TagTarget): Promise<TagRelation[]> {
  if (target.type === 'sentence') {
    return getRelationsByIndex(SENTENCE_ID_INDEX, target.id)
  }
  return getRelationsByIndex(DOCUMENT_ID_INDEX, target.id)
}

export function getTagRelationsByWord(wordId: number): Promise<TagRelation[]> {
  return getRelationsByIndex(WORD_ID_INDEX, wordId)
}

async function getRelationsByIndex(indexName: string, key: number): Promise<TagRelation[]> {
  if (!Number.isInteger(key)) {
    return []
  }
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relations = await awaitRequest<Relation[]>(relationStore.index(indexName).getAll(key))
  return relations.filter(checkIsTag)
}

function checkIsTag(relation: Relation): relation is TagRelation {
  return relation.type === 'Tag'
}
