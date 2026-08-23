import type { AnswerDraft } from './types'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { RelationQuestion } from '../relation/types'

export function checkIsAnswerReady(question: RelationQuestion, answer: AnswerDraft): boolean {
  const spec = QuestionSpecs[question.type].answer
  switch (spec.kind) {
    case 'text':
      return spec.isRequired ? !!answer.text : true
    case 'similarity':
      return answer.similarity !== null
    case 'selection':
      return answer.selection !== null
    case 'words':
      return spec.keys.every((_, index) => !!answer.words[index])
    case 'none':
      return true
  }
}
