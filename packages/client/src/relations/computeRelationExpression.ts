import { SKIP_LABEL } from './consts'
import { createUsageFallbackTokens } from './createUsageFallbackTokens'
import type { ExpressionToken } from './types'
import { getSimilarityLabel } from '../qna/labels'
import type {
  BinaryAssociationRelation,
  BinaryCommonRelation,
  BinaryDifferenceRelation,
  BinarySimilarityRelation,
  NamedAssociationRelation,
  Relation,
  TernaryCompositionRelation,
  TernaryIsolationRelation,
  UnaryPropertyRelation,
  WordOrSentence,
  WordsUsageRelation,
} from '../relation/types'

type BinaryRelation =
  | UnaryPropertyRelation
  | BinaryCommonRelation
  | BinaryDifferenceRelation
  | BinarySimilarityRelation
  | BinaryAssociationRelation

type TernaryRelation =
  TernaryIsolationRelation | TernaryCompositionRelation | NamedAssociationRelation

export function computeRelationExpression(relation: Relation): ExpressionToken[] {
  if (relation.type === 'DocumentToSentence') {
    return [
      { kind: 'extraction', sentenceId: relation.sentenceId, documentId: relation.documentId },
    ]
  }
  if (relation.type === 'WordExplain') {
    return [word(relation.wordId), text(': '), toAnswerToken(relation.answer)]
  }
  if (relation.type === 'WordsUsage') {
    return computeUsageExpression(relation)
  }
  if ('word3Id' in relation) {
    return computeTernaryExpression(relation)
  }
  return computeBinaryExpression(relation)
}

function computeUsageExpression(relation: WordsUsageRelation): ExpressionToken[] {
  if (relation.answer?.type === 'sentence') {
    return [{ kind: 'usage', sentenceId: relation.answer.id, wordIds: relation.wordIds }]
  }
  return createUsageFallbackTokens(toAnswerToken(relation.answer), relation.wordIds)
}

function computeBinaryExpression(relation: BinaryRelation): ExpressionToken[] {
  const word1 = word(relation.word1Id)
  const word2 = word(relation.word2Id)
  if (relation.type === 'UnaryProperty') {
    return [word1, text(' - '), word2]
  }
  if (relation.type === 'BinaryCommon') {
    return [word1, text(' ∩ '), word2, text(' = '), toAnswerToken(relation.answer)]
  }
  if (relation.type === 'BinaryDifference') {
    return [word1, text(' ↔ '), word2, text(' = '), toAnswerToken(relation.answer)]
  }
  if (relation.type === 'BinarySimilarity') {
    return [
      text('|'),
      word1,
      text(' - '),
      word2,
      text('| = '),
      text(getSimilarityLabel(relation.similarity)),
    ]
  }
  return [word1, text(' ~ '), word2]
}

function computeTernaryExpression(relation: TernaryRelation): ExpressionToken[] {
  const word1 = word(relation.word1Id)
  const word2 = word(relation.word2Id)
  const word3 = word(relation.word3Id)
  if (relation.type === 'TernaryIsolation') {
    const words = [word1, word2, word3]
    const selected = words[relation.selection - 1]
    const others = words.filter((_, index) => index !== relation.selection - 1)
    return [others[0], text(', '), others[1], text(' ↔ '), selected]
  }
  if (relation.type === 'TernaryComposition') {
    return [word3, text(' = '), word1, text(' + '), word2]
  }
  return [word1, text(' ──'), word3, text('─→ '), word2]
}

function toAnswerToken(answer: WordOrSentence | null): ExpressionToken {
  if (!answer) {
    return { kind: 'text', value: SKIP_LABEL, isMuted: true }
  }
  if (answer.type === 'word') {
    return word(answer.id)
  }
  return { kind: 'sentence', id: answer.id }
}

function text(value: string): ExpressionToken {
  return { kind: 'text', value }
}

function word(wordId: number): ExpressionToken {
  return { kind: 'word', id: wordId }
}
