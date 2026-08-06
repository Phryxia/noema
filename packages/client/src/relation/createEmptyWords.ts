import type { QuestionType } from '../question/types'
import { SubjectWordSpecs } from './consts'

export function createEmptyWords(type: QuestionType): string[] {
  return Array.from({ length: SubjectWordSpecs[type].count }, () => '')
}
