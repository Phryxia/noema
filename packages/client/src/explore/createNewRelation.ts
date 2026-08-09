import type { AnswerDraft } from './types'
import type { NewQuestion } from '../question/types'
import type { NewRelation, Similarity, WordOrSentence } from '../relation/types'

export function createNewRelation(
  question: NewQuestion,
  answer: AnswerDraft,
  answerTarget: WordOrSentence | null,
  commentTarget: WordOrSentence | null,
): NewRelation {
  const comment = commentTarget ? { comment: commentTarget } : {}
  switch (question.type) {
    case 'WordExplain':
      return {
        ...comment,
        type: question.type,
        wordId: question.wordId,
        answer: requireTarget(answerTarget),
      }
    case 'WordsUsage':
      return {
        ...comment,
        type: question.type,
        wordIds: question.wordIds,
        answer: answerTarget,
      }
    case 'BinaryCommon':
      return {
        ...comment,
        type: question.type,
        word1Id: question.word1Id,
        word2Id: question.word2Id,
        answer: answerTarget,
      }
    case 'BinaryDifference':
      return {
        ...comment,
        type: question.type,
        word1Id: question.word1Id,
        word2Id: question.word2Id,
        answer: answerTarget,
      }
    case 'BinarySimilarity':
      return {
        ...comment,
        type: question.type,
        word1Id: question.word1Id,
        word2Id: question.word2Id,
        similarity: requireSimilarity(answer.similarity),
      }
    case 'BinaryAssociation':
      return {
        ...comment,
        type: question.type,
        word1Id: question.wordId,
        word2Id: requireWordTarget(answerTarget).id,
      }
    case 'TernaryIsolation':
      return {
        ...comment,
        type: question.type,
        word1Id: question.word1Id,
        word2Id: question.word2Id,
        word3Id: question.word3Id,
        selection: requireSelection(answer.selection),
      }
  }
}

function requireTarget(target: WordOrSentence | null): WordOrSentence {
  if (!target) {
    throw new Error('답을 입력해야 합니다')
  }
  return target
}

function requireWordTarget(target: WordOrSentence | null): WordOrSentence {
  if (target?.type !== 'word') {
    throw new Error('답 단어를 입력해야 합니다')
  }
  return target
}

function requireSimilarity(similarity: Similarity | null): Similarity {
  if (similarity === null) {
    throw new Error('유사성을 골라야 합니다')
  }
  return similarity
}

function requireSelection(selection: 1 | 2 | 3 | null): 1 | 2 | 3 {
  if (selection === null) {
    throw new Error('단어를 골라야 합니다')
  }
  return selection
}
