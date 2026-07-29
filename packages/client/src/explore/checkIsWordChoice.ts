import type { QuestionType } from '../question/types'

export function checkIsWordChoice(type: QuestionType): boolean {
  return type === 'TernaryIsolation'
}
