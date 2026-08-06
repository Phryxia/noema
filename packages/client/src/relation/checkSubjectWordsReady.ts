import { SubjectWordSpecs } from './consts'
import type { QuestionType } from '../question/types'

export function checkSubjectWordsReady(type: QuestionType, words: string[]): boolean {
  const filledWords = words.filter(Boolean)
  if (filledWords.length < SubjectWordSpecs[type].minCount) {
    return false
  }
  return new Set(filledWords).size === filledWords.length
}
