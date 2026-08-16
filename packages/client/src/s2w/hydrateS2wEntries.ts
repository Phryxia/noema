import type { S2wEntry } from './types'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
import type { SentenceToWordRelation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

export async function hydrateS2wEntries(
  relations: SentenceToWordRelation[],
): Promise<S2wEntry[]> {
  const wordIds = Array.from(new Set(relations.map((relation) => relation.wordId)))
  const sentenceIds = Array.from(new Set(relations.map((relation) => relation.sentenceId)))
  const [wordMap, sentenceMap] = await Promise.all([
    resolveWordMap(wordIds),
    resolveSentenceMap(sentenceIds),
  ])
  return relations.map((relation) => ({
    id: relation.relationId,
    createdAt: relation.createdAt,
    word: {
      wordId: relation.wordId,
      value: wordMap.get(relation.wordId) ?? '',
    },
    sentence: {
      sentenceId: relation.sentenceId,
      value: sentenceMap.get(relation.sentenceId) ?? '',
    },
  }))
}
