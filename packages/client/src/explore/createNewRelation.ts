import type { AnswerDraft } from './types'
import { placeWordKeys } from '../relation/placeWordKeys'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { QuestionAnswer, QuestionGiven } from '../relation/questionSpecs'
import type {
  NewRelation,
  RelationQuestion,
  Similarity,
  TernaryWords,
  WordKey,
  WordOrSentence,
} from '../relation/types'

export interface RelationTargets {
  answer: WordOrSentence | null
  answerWordIds: number[]
  comment: WordOrSentence | null
}

type GivenWords = { wordId: number } | { wordIds: number[] } | Partial<TernaryWords>

type AnswerFields =
  | { answer: WordOrSentence | null }
  | { similarity: Similarity }
  | { selection: 1 | 2 | 3 }
  | Partial<TernaryWords>

export function createNewRelation(
  question: RelationQuestion,
  answer: AnswerDraft,
  targets: RelationTargets,
): NewRelation {
  const spec = QuestionSpecs[question.type]
  const comment = targets.comment ? { comment: targets.comment } : {}
  return {
    type: question.type,
    ...placeGivenWords(spec.given, question.wordIds),
    ...createAnswerFields(spec.answer, answer, targets),
    ...comment,
  } as NewRelation
}

function placeGivenWords(given: QuestionGiven, wordIds: number[]): GivenWords {
  if (given === 'wordIds') {
    return { wordIds }
  }
  if (given === 'wordId') {
    return { wordId: wordIds[0] }
  }
  return placeWordKeys(given, wordIds)
}

function createAnswerFields(
  answer: QuestionAnswer,
  draft: AnswerDraft,
  targets: RelationTargets,
): AnswerFields {
  switch (answer.kind) {
    case 'text':
      return { answer: answer.isRequired ? requireTarget(targets.answer) : targets.answer }
    case 'similarity':
      return { similarity: requireSimilarity(draft.similarity) }
    case 'selection':
      return { selection: requireSelection(draft.selection) }
    case 'words':
      return placeWordKeys(
        answer.keys,
        requireAnswerWordIds(targets.answerWordIds, answer.keys),
      )
    case 'none':
      return {}
  }
}

function requireAnswerWordIds(wordIds: number[], keys: WordKey[]): number[] {
  if (wordIds.length < keys.length) {
    throw new Error(
      keys.length === 1 ? '답 단어를 입력해야 합니다' : '두 단어를 입력해야 합니다',
    )
  }
  return wordIds
}

function requireTarget(target: WordOrSentence | null): WordOrSentence {
  if (!target) {
    throw new Error('답을 입력해야 합니다')
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
