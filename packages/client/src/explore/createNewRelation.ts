import type { AnswerDraft } from './types'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { QuestionAnswer, QuestionGiven } from '../relation/questionSpecs'
import type {
  NewRelation,
  RelationQuestion,
  Similarity,
  WordOrSentence,
  WordSlot,
} from '../relation/types'

export interface RelationTargets {
  answer: WordOrSentence | null
  answerWordIds: number[]
  comment: WordOrSentence | null
}

type RelationFields = Record<string, unknown>

export function createNewRelation(
  question: RelationQuestion,
  answer: AnswerDraft,
  targets: RelationTargets,
): NewRelation {
  const spec = QuestionSpecs[question.type]
  const fields: RelationFields = {
    type: question.type,
    ...placeGivenWords(spec.given, question.wordIds),
    ...createAnswerFields(spec.answer, answer, targets),
  }
  if (targets.comment) {
    fields.comment = targets.comment
  }
  return fields as NewRelation
}

function placeGivenWords(given: QuestionGiven, wordIds: number[]): RelationFields {
  if (given === 'wordIds') {
    return { wordIds }
  }
  if (given === 'wordId') {
    return { wordId: wordIds[0] }
  }
  return placeSlots(given, wordIds)
}

function createAnswerFields(
  answer: QuestionAnswer,
  draft: AnswerDraft,
  targets: RelationTargets,
): RelationFields {
  switch (answer.kind) {
    case 'text':
      return { answer: answer.isRequired ? requireTarget(targets.answer) : targets.answer }
    case 'similarity':
      return { similarity: requireSimilarity(draft.similarity) }
    case 'selection':
      return { selection: requireSelection(draft.selection) }
    case 'words':
      return placeSlots(answer.slots, requireAnswerWordIds(targets.answerWordIds, answer.slots))
    case 'none':
      return {}
  }
}

function placeSlots(slots: WordSlot[], wordIds: number[]): RelationFields {
  return Object.fromEntries(slots.map((slot, index) => [slot, wordIds[index]]))
}

function requireAnswerWordIds(wordIds: number[], slots: WordSlot[]): number[] {
  if (wordIds.length < slots.length || wordIds.some((id) => id === undefined)) {
    throw new Error(
      slots.length === 1 ? '답 단어를 입력해야 합니다' : '두 단어를 입력해야 합니다',
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
