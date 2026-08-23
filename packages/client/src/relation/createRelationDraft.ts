import type { WordRelationType } from './types'
import type { QuestionDraft } from '../explore/types'

export function createRelationDraft(type: WordRelationType, words: string[]): QuestionDraft {
  return {
    question: { type, wordIds: createPlaceholderIds(type, words) },
    lexes: words.map((value, nodeId) => ({ nodeId, value })),
  }
}

function createPlaceholderIds(type: WordRelationType, words: string[]): number[] {
  if (type === 'WordsUsage') {
    return words.filter(Boolean).map((_, index) => index)
  }
  return words.map((_, index) => index)
}
