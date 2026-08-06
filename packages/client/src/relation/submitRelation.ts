import { TEACH_SOURCE_PREFIX } from './consts'
import { createRelationQuestion } from './createRelationQuestion'
import { submitAnswer } from '../explore/submitAnswer'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import type { QuestionType } from '../question/types'
import { createWord } from '../word/word.service'

export interface SubmitRelationParams {
  type: QuestionType
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
    question: createRelationQuestion(type, wordIds),
    answer,
    comment,
    sourcePrefix: TEACH_SOURCE_PREFIX,
  })
}
