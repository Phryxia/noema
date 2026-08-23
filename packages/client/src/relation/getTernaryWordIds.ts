import type { TernaryWords } from './types'
import type { NewQuestion } from '../question/types'

export function getTernaryWordIds(
  question: NewQuestion,
  answerWordIds: number[],
): TernaryWords | null {
  if (question.type === 'NamedAssociation') {
    return { word1Id: question.word1Id, word2Id: question.word2Id, word3Id: question.word3Id }
  }
  if (question.type === 'TernaryComposition') {
    const [word1Id, word2Id] = answerWordIds
    if (word1Id === undefined || word2Id === undefined) {
      return null
    }
    return { word1Id, word2Id, word3Id: question.word3Id }
  }
  return null
}
