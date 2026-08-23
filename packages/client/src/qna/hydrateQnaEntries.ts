import { getQuestionWordIds } from '../relation/getQuestionWordIds'
import { getRelationAnswer } from '../relation/getRelationAnswer'
import { getRelationAnswerWordIds } from '../relation/getRelationAnswerWordIds'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { WordRelation, WordOrSentence } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'
import { getWordValues } from '../word/getWordValues'
import type { QnaAnswer, QnaEntry, ResolvedText, ResolvedWord } from './types'

export async function hydrateQnaEntries(relations: WordRelation[]): Promise<QnaEntry[]> {
  const wordIds = collectWordIds(relations)
  const sentenceIds = collectSentenceIds(relations)
  const [wordMap, sentenceMap] = await Promise.all([
    resolveWordMap(wordIds),
    resolveSentenceMap(sentenceIds),
  ])
  return relations.map((relation) => toQnaEntry(relation, wordMap, sentenceMap))
}

export function collectWordIds(relations: WordRelation[]): number[] {
  const ids = new Set<number>()
  for (const relation of relations) {
    getQuestionWordIds(relation).forEach((id) => ids.add(id))
    getRelationAnswerWordIds(relation).forEach((id) => ids.add(id))
    getTextRefs(relation).forEach((ref) => {
      if (ref.type === 'word') {
        ids.add(ref.id)
      }
    })
  }
  return Array.from(ids)
}

export function collectSentenceIds(relations: WordRelation[]): number[] {
  const ids = new Set<number>()
  for (const relation of relations) {
    getTextRefs(relation).forEach((ref) => {
      if (ref.type === 'sentence') {
        ids.add(ref.id)
      }
    })
  }
  return Array.from(ids)
}

function getTextRefs(relation: WordRelation): WordOrSentence[] {
  const refs: WordOrSentence[] = []
  const answer = getRelationAnswer(relation)
  if (answer) {
    refs.push(answer)
  }
  if (relation.comment) {
    refs.push(relation.comment)
  }
  return refs
}

export async function resolveWordMap(wordIds: number[]): Promise<Map<number, string>> {
  const values = await getWordValues(wordIds)
  return new Map(wordIds.map((id, index) => [id, values[index]]))
}

function toQnaEntry(
  relation: WordRelation,
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): QnaEntry {
  const words = getQuestionWordIds(relation).map((id) => toResolvedWord(id, wordMap))
  return {
    id: relation.relationId,
    type: relation.type,
    createdAt: relation.createdAt,
    words: getDisplayWords(relation, words),
    answer: buildAnswer(relation, words, wordMap, sentenceMap),
    comment: relation.comment ? resolveText(relation.comment, wordMap, sentenceMap) : null,
  }
}

function getDisplayWords(relation: WordRelation, words: ResolvedWord[]): ResolvedWord[] {
  if (relation.type === 'NamedAssociation') {
    return words.slice(0, 2)
  }
  return words
}

function buildAnswer(
  relation: WordRelation,
  words: ResolvedWord[],
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): QnaAnswer {
  if (relation.type === 'BinarySimilarity') {
    return { kind: 'similarity', similarity: relation.similarity }
  }
  if (relation.type === 'TernaryIsolation') {
    return { kind: 'selection', word: words[relation.selection - 1] }
  }
  if (relation.type === 'NamedAssociation') {
    return { kind: 'selection', word: words[2] }
  }
  const spec = QuestionSpecs[relation.type].answer
  if (spec.kind === 'words') {
    return {
      kind: 'words',
      words: getRelationAnswerWordIds(relation).map((id) => toResolvedWord(id, wordMap)),
      separator: spec.layout === 'composition' ? ' + ' : ', ',
    }
  }
  const answer = getRelationAnswer(relation)
  if (!answer) {
    return { kind: 'skip' }
  }
  return { kind: 'text', text: resolveText(answer, wordMap, sentenceMap) }
}

function resolveText(
  ref: WordOrSentence,
  wordMap: Map<number, string>,
  sentenceMap: Map<number, string>,
): ResolvedText {
  if (ref.type === 'word') {
    return { type: 'word', word: toResolvedWord(ref.id, wordMap) }
  }
  return { type: 'sentence', sentenceId: ref.id, value: sentenceMap.get(ref.id) ?? '' }
}

function toResolvedWord(wordId: number, wordMap: Map<number, string>): ResolvedWord {
  return { wordId, value: wordMap.get(wordId) ?? '' }
}
