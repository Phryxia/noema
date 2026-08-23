import { QuestionSpecs } from './questionSpecs'
import type { WordRelationType } from './types'

export function checkSubjectWordsReady(type: WordRelationType, words: string[]): boolean {
  const filledWords = words.filter(Boolean)
  if (filledWords.length < QuestionSpecs[type].subject.minCount) {
    return false
  }
  if (type === 'NamedAssociation') {
    return true
  }
  return new Set(filledWords).size === filledWords.length
}
