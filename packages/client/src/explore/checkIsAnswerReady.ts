import type { AnswerDraft } from './types'
import type { NewQuestion } from '../question/types'

export function checkIsAnswerReady(question: NewQuestion, answer: AnswerDraft): boolean {
  if (question.type === 'BinarySimilarity') {
    return answer.similarity !== null
  }
  if (question.type === 'TernaryIsolation') {
    return answer.selection !== null
  }
  if (question.type === 'TernaryComposition') {
    return answer.words.length === 2 && answer.words.every(Boolean)
  }
  if (
    question.type === 'WordsUsage' ||
    question.type === 'BinaryCommon' ||
    question.type === 'BinaryDifference' ||
    question.type === 'NamedAssociation'
  ) {
    return true
  }
  return !!answer.text
}
