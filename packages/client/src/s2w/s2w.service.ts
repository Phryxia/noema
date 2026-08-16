import { RELATIONS_STORE, SENTENCE_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { Relation, SentenceToWordRelation } from '../relation/types'

export async function getSentenceToWordRelationsBySentence(
  sentenceId: number,
): Promise<SentenceToWordRelation[]> {
  if (!Number.isInteger(sentenceId)) {
    return []
  }
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relations = await awaitRequest<Relation[]>(
    relationStore.index(SENTENCE_ID_INDEX).getAll(sentenceId),
  )
  return relations.filter(checkIsSentenceToWord)
}

function checkIsSentenceToWord(relation: Relation): relation is SentenceToWordRelation {
  return relation.type === 'SentenceToWord'
}
