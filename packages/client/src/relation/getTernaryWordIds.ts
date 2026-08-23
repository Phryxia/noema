import { placeWordKeys } from './placeWordKeys'
import { QuestionSpecs } from './questionSpecs'
import type { RelationQuestion, TernaryWords, WordRelationType } from './types'

export function checkIsTernaryRelationType(type: WordRelationType): boolean {
  return type === 'TernaryComposition' || type === 'NamedAssociation'
}

export function getTernaryWordIds(
  question: RelationQuestion,
  answerWordIds: number[],
): TernaryWords | null {
  if (!checkIsTernaryRelationType(question.type)) {
    return null
  }
  const { given, answer } = QuestionSpecs[question.type]
  const words: Partial<TernaryWords> = {
    ...(Array.isArray(given) ? placeWordKeys(given, question.wordIds) : {}),
    ...(answer.kind === 'words' ? placeWordKeys(answer.keys, answerWordIds) : {}),
  }
  if (
    words.word1Id === undefined ||
    words.word2Id === undefined ||
    words.word3Id === undefined
  ) {
    return null
  }
  return { word1Id: words.word1Id, word2Id: words.word2Id, word3Id: words.word3Id }
}
