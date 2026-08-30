import type { D2sEntry } from './types'
import { resolveDocumentTitleMap } from '../document/resolveDocumentTitleMap'
import type { DocumentTitleRelation, DocumentToSentenceRelation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

export async function hydrateD2sEntries(
  relations: (DocumentToSentenceRelation | DocumentTitleRelation)[],
): Promise<D2sEntry[]> {
  const documentIds = Array.from(new Set(relations.map((relation) => relation.documentId)))
  const sentenceIds = Array.from(new Set(relations.map((relation) => relation.sentenceId)))
  const [titleMap, sentenceMap] = await Promise.all([
    resolveDocumentTitleMap(documentIds),
    resolveSentenceMap(sentenceIds),
  ])
  return relations.map((relation) => ({
    id: relation.relationId,
    createdAt: relation.createdAt,
    document: {
      documentId: relation.documentId,
      title: titleMap.get(relation.documentId) ?? '',
    },
    sentence: {
      sentenceId: relation.sentenceId,
      value: sentenceMap.get(relation.sentenceId) ?? '',
    },
  }))
}
