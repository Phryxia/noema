import type { D2sEntry } from './types'
import { resolveDocumentMap } from '../document/resolveDocumentMap'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import type { DocumentToSentenceRelation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

export async function hydrateD2sEntries(
  relations: DocumentToSentenceRelation[],
): Promise<D2sEntry[]> {
  const documentIds = Array.from(new Set(relations.map((relation) => relation.documentId)))
  const sentenceIds = Array.from(new Set(relations.map((relation) => relation.sentenceId)))
  const [documentMap, sentenceMap] = await Promise.all([
    resolveDocumentMap(documentIds),
    resolveSentenceMap(sentenceIds),
  ])
  return relations.map((relation) => ({
    id: relation.relationId,
    createdAt: relation.createdAt,
    document: {
      documentId: relation.documentId,
      preview: createPreview(documentMap.get(relation.documentId) ?? '', VALUE_PREVIEW_LENGTH),
    },
    sentence: {
      sentenceId: relation.sentenceId,
      value: sentenceMap.get(relation.sentenceId) ?? '',
    },
  }))
}
