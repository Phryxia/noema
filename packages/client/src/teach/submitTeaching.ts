import { TEACH_SOURCE_PREFIX } from './consts'
import { createTeachQuestion } from './createTeachQuestion'
import { submitAnswer } from '../explore/submitAnswer'
import type { AnswerDraft, CommentDraft } from '../explore/types'
import type { QuestionType } from '../question/types'
import { createWord } from '../word/word.service'

export interface SubmitTeachingParams {
  type: QuestionType
  words: string[]
  answer: AnswerDraft
  comment: CommentDraft
}

export async function submitTeaching({
  type,
  words,
  answer,
  comment,
}: SubmitTeachingParams): Promise<void> {
  const wordIds: number[] = []
  for (const word of words.filter(Boolean)) {
    wordIds.push(await createWord(word))
  }
  await submitAnswer({
    question: createTeachQuestion(type, wordIds),
    answer,
    comment,
    sourcePrefix: TEACH_SOURCE_PREFIX,
  })
}
