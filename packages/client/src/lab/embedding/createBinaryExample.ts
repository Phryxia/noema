import type { BinaryExample } from './model/types'
import type { AnswerDraft } from '../../explore/types'
import type { NewQuestion } from '../../question/types'
import type { Relation } from '../../relation/types'

export function createExampleFromRelation(relation: Relation): BinaryExample | null {
  if (relation.type === 'BinarySimilarity') {
    return {
      word1Id: relation.word1Id,
      word2Id: relation.word2Id,
      label: relation.similarity === 0 ? 0 : 1,
    }
  }
  if (relation.type === 'BinaryCommon' || relation.type === 'BinaryDifference') {
    return {
      word1Id: relation.word1Id,
      word2Id: relation.word2Id,
      label: relation.answer ? 1 : 0,
    }
  }
  return null
}

export function createExampleFromAnswer(
  question: NewQuestion,
  answer: AnswerDraft,
): BinaryExample | null {
  if (question.type === 'BinarySimilarity') {
    if (answer.similarity === null) {
      return null
    }
    return {
      word1Id: question.word1Id,
      word2Id: question.word2Id,
      label: answer.similarity === 0 ? 0 : 1,
    }
  }
  if (question.type === 'BinaryCommon' || question.type === 'BinaryDifference') {
    return {
      word1Id: question.word1Id,
      word2Id: question.word2Id,
      label: answer.text ? 1 : 0,
    }
  }
  return null
}
