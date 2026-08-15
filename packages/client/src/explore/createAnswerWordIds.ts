import type { AnswerDraft } from './types'
import { createWord } from '../word/word.service'

export async function createAnswerWordIds(answer: AnswerDraft): Promise<number[]> {
  const wordIds: number[] = []
  for (const word of answer.words.filter(Boolean)) {
    wordIds.push(await createWord(word))
  }
  return wordIds
}
