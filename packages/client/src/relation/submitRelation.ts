import { TEACH_SOURCE_PREFIX } from './consts'
import type { WordRelationType } from './types'
import { submitAnswer } from '../explore/submitAnswer'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import { createWord } from '../word/word.service'

export interface SubmitRelationParams {
  type: WordRelationType
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export async function submitRelation({
  type,
  words,
  answer,
  comment,
}: SubmitRelationParams): Promise<void> {
  const wordIds: number[] = []
  for (const word of words.filter(Boolean)) {
    wordIds.push(await createWord(word))
  }
  await submitAnswer({
    question: { type, wordIds },
    answer,
    comment,
    sourcePrefix: TEACH_SOURCE_PREFIX,
  })
}
