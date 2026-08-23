import { SubjectWordSpecs } from './consts'
import type { WordRelationType } from './types'

export function createEmptyWords(type: WordRelationType): string[] {
  return Array.from({ length: SubjectWordSpecs[type].count }, () => '')
}
