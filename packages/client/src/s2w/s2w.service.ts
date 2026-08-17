import { RELATIONS_STORE, SENTENCE_ID_INDEX, WORD_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { Relation, SentenceToWordRelation } from '../relation/types'

export function getSentenceToWordRelationsBySentence(
  sentenceId: number,
): Promise<SentenceToWordRelation[]> {
  return getRelationsByIndex(SENTENCE_ID_INDEX, sentenceId)
}

export function getSentenceToWordRelationsByWord(
  wordId: number,
): Promise<SentenceToWordRelation[]> {
  return getRelationsByIndex(WORD_ID_INDEX, wordId)
}

async function getRelationsByIndex(
  indexName: string,
  key: number,
): Promise<SentenceToWordRelation[]> {
  if (!Number.isInteger(key)) {
    return []
  }
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relations = await awaitRequest<Relation[]>(relationStore.index(indexName).getAll(key))
  return relations.filter(checkIsSentenceToWord)
}

function checkIsSentenceToWord(relation: Relation): relation is SentenceToWordRelation {
  return relation.type === 'SentenceToWord'
}
