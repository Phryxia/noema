import { checkIsSentenceTag } from './checkIsSentenceTag'
import type { ResolvedTagTarget, TagEntry } from './types'
import { resolveDocumentMap } from '../document/resolveDocumentMap'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import type { TagRelation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

export async function hydrateTagEntries(relations: TagRelation[]): Promise<TagEntry[]> {
  const wordIds = new Set<number>()
  const sentenceIds = new Set<number>()
  const documentIds = new Set<number>()
  for (const relation of relations) {
    wordIds.add(relation.wordId)
    if (checkIsSentenceTag(relation)) {
      sentenceIds.add(relation.sentenceId)
      continue
    }
    documentIds.add(relation.documentId)
  }
  const [wordMap, sentenceMap, documentMap] = await Promise.all([
    resolveWordMap(Array.from(wordIds)),
    resolveSentenceMap(Array.from(sentenceIds)),
    resolveDocumentMap(Array.from(documentIds)),
  ])

  function resolveTarget(relation: TagRelation): ResolvedTagTarget {
    if (checkIsSentenceTag(relation)) {
      return {
        type: 'sentence',
        sentenceId: relation.sentenceId,
        value: sentenceMap.get(relation.sentenceId) ?? '',
      }
    }
    return {
      type: 'document',
      documentId: relation.documentId,
      preview: createPreview(documentMap.get(relation.documentId) ?? '', VALUE_PREVIEW_LENGTH),
    }
  }

  return relations.map((relation) => ({
    id: relation.relationId,
    createdAt: relation.createdAt,
    word: { wordId: relation.wordId, value: wordMap.get(relation.wordId) ?? '' },
    target: resolveTarget(relation),
  }))
}
