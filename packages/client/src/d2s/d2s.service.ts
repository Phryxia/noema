import { DOCUMENT_ID_INDEX, RELATIONS_STORE, SENTENCE_ID_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { DocumentToSentenceRelation, Relation } from '../relation/types'

export function getDocumentToSentenceRelationsByDocument(
  documentId: number,
): Promise<DocumentToSentenceRelation[]> {
  return getRelationsByIndex(DOCUMENT_ID_INDEX, documentId)
}

export function getDocumentToSentenceRelationsBySentence(
  sentenceId: number,
): Promise<DocumentToSentenceRelation[]> {
  return getRelationsByIndex(SENTENCE_ID_INDEX, sentenceId)
}

async function getRelationsByIndex(
  indexName: string,
  key: number,
): Promise<DocumentToSentenceRelation[]> {
  if (!Number.isInteger(key)) {
    return []
  }
  const db = await openNoemaDB()
  const relationStore = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const relations = await awaitRequest<Relation[]>(relationStore.index(indexName).getAll(key))
  return relations.filter(checkIsDocumentToSentence)
}

function checkIsDocumentToSentence(relation: Relation): relation is DocumentToSentenceRelation {
  return relation.type === 'DocumentToSentence'
}
