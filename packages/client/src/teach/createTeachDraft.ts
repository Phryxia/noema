import { createTeachQuestion } from './createTeachQuestion'
import type { QuestionDraft } from '../explore/types'
import type { QuestionType } from '../question/types'

export function createTeachDraft(type: QuestionType, words: string[]): QuestionDraft {
  return {
    question: createTeachQuestion(type, createPlaceholderIds(type, words)),
    lexes: words.map((value, nodeId) => ({ nodeId, value })),
  }
}

function createPlaceholderIds(type: QuestionType, words: string[]): number[] {
  if (type === 'WordsUsage') {
    return words.filter(Boolean).map((_, index) => index)
  }
  return words.map((_, index) => index)
}
