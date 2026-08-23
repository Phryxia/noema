import { QuestionSpecs } from '../relation/questionSpecs'
import type { WordRelationType } from '../relation/types'

export function checkIsWordChoice(type: WordRelationType): boolean {
  return QuestionSpecs[type].answer.kind === 'selection'
}
