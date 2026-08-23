import { DEFAULT_USAGE_WORD_COUNT } from './consts'
import type { QuestionPick } from './types'
import { QuestionSpecs } from '../relation/questionSpecs'
import type { WordRelationType } from '../relation/types'
import { getRandomWords } from '../word/getRandomWords'

export async function pickQuestion(
  types: WordRelationType[],
  usageWordCount: number = DEFAULT_USAGE_WORD_COUNT,
): Promise<QuestionPick> {
  if (!types.length) {
    return { status: 'noType' }
  }
  const type = pickOne(types)
  const wordCount = pickWordCount(type, usageWordCount)
  const lexes = await getRandomWords(wordCount)
  if (lexes.length < wordCount) {
    return { status: 'noWord' }
  }
  const wordIds = lexes.map(({ nodeId }) => nodeId)
  return { status: 'ok', draft: { question: { type, wordIds }, lexes } }
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function pickWordCount(type: WordRelationType, usageWordCount: number): number {
  const { given } = QuestionSpecs[type]
  if (given === 'wordIds') {
    return usageWordCount
  }
  if (given === 'wordId') {
    return 1
  }
  return given.length
}
