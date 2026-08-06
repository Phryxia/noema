import type { NewQuestion, QuestionType } from '../question/types'

export function createRelationQuestion(type: QuestionType, wordIds: number[]): NewQuestion {
  switch (type) {
    case 'WordExplain':
      return { type, wordId: wordIds[0] }
    case 'WordsUsage':
      return { type, wordIds }
    case 'BinaryCommon':
      return { type, word1Id: wordIds[0], word2Id: wordIds[1] }
    case 'BinaryDifference':
      return { type, word1Id: wordIds[0], word2Id: wordIds[1] }
    case 'BinarySimilarity':
      return { type, word1Id: wordIds[0], word2Id: wordIds[1] }
    case 'TernaryIsolation':
      return { type, word1Id: wordIds[0], word2Id: wordIds[1], word3Id: wordIds[2] }
  }
}
