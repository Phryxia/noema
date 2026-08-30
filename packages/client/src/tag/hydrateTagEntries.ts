import { checkIsSentenceTag } from './checkIsSentenceTag'
import type { ResolvedTagTarget, TagEntry } from './types'
import { resolveDocumentTitleMap } from '../document/resolveDocumentTitleMap'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
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
  const [wordMap, sentenceMap, titleMap] = await Promise.all([
    resolveWordMap(Array.from(wordIds)),
    resolveSentenceMap(Array.from(sentenceIds)),
    resolveDocumentTitleMap(Array.from(documentIds)),
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
      title: titleMap.get(relation.documentId) ?? '',
    }
  }

  return relations.map((relation) => ({
    id: relation.relationId,
    createdAt: relation.createdAt,
    word: { wordId: relation.wordId, value: wordMap.get(relation.wordId) ?? '' },
    target: resolveTarget(relation),
  }))
}
