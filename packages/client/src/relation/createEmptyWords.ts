import { QuestionSpecs } from './questionSpecs'
import type { WordRelationType } from './types'

export function createEmptyWords(type: WordRelationType): string[] {
  return Array.from({ length: QuestionSpecs[type].subject.count }, () => '')
}
