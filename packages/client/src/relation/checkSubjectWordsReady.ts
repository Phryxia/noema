import { SubjectWordSpecs } from './consts'
import type { WordRelationType } from './types'

export function checkSubjectWordsReady(type: WordRelationType, words: string[]): boolean {
  const filledWords = words.filter(Boolean)
  if (filledWords.length < SubjectWordSpecs[type].minCount) {
    return false
  }
  if (type === 'NamedAssociation') {
    return true
  }
  return new Set(filledWords).size === filledWords.length
}
