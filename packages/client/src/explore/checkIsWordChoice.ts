import type { WordRelationType } from '../relation/types'

export function checkIsWordChoice(type: WordRelationType): boolean {
  return type === 'TernaryIsolation'
}
