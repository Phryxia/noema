import type { WordRelation, WordOrSentence } from '../../relation/types'
import type { SearchField, SearchTarget } from './types'

export function collectSearchTargets(
  relation: WordRelation,
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): SearchTarget[] {
  const targets = [
    ...collectQuestionWordTargets(relation, wordMap),
    ...collectTextTargets(relation, wordMap, sentenceMap),
  ]
  return targets.filter((target) => !!target.value)
}

function collectQuestionWordTargets(
  relation: WordRelation,
  wordMap: Map<number, string>,
): SearchTarget[] {
  if (relation.type === 'WordExplain') {
    return [createWordTarget('word', relation.wordId, wordMap)]
  }
  if (relation.type === 'WordsUsage') {
    return relation.wordIds.map((wordId) => createWordTarget('word', wordId, wordMap))
  }
  const targets = [
    createWordTarget('word1', relation.word1Id, wordMap),
    createWordTarget('word2', relation.word2Id, wordMap),
  ]
  if ('word3Id' in relation) {
    targets.push(createWordTarget('word3', relation.word3Id, wordMap))
  }
  return targets
}

function collectTextTargets(
  relation: WordRelation,
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): SearchTarget[] {
  const targets: SearchTarget[] = []
  const answer = 'answer' in relation ? relation.answer : null
  if (answer) {
    targets.push(createTextTarget('answer', answer, wordMap, sentenceMap))
  }
  if (relation.comment) {
    targets.push(createTextTarget('comment', relation.comment, wordMap, sentenceMap))
  }
  return targets
}

function createWordTarget(
  field: SearchField,
  wordId: number,
  wordMap: Map<number, string>,
): SearchTarget {
  return { field, textType: 'word', value: wordMap.get(wordId) ?? '' }
}

function createTextTarget(
  field: SearchField,
  ref: WordOrSentence,
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): SearchTarget {
  if (ref.type === 'word') {
    return { field, textType: 'word', value: wordMap.get(ref.id) ?? '' }
  }
  return { field, textType: 'sentence', value: sentenceMap.get(ref.id) ?? '' }
}
