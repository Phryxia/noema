import type { AnswerDraft } from './types'
import type { NewQuestion } from '../question/types'

export function checkIsAnswerReady(question: NewQuestion, answer: AnswerDraft): boolean {
  if (question.type === 'BinarySimilarity') {
    return answer.similarity !== null
  }
  if (question.type === 'TernaryIsolation') {
    return answer.selection !== null
  }
  if (question.type === 'WordsUsage') {
    return true
  }
  return !!answer.text
}
