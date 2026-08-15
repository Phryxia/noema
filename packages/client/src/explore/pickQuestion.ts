import { DEFAULT_USAGE_WORD_COUNT } from './consts'
import type { QuestionPick } from './types'
import type { NewQuestion, QuestionType } from '../question/types'
import { getRandomWords } from '../word/getRandomWords'
import type { Lexis } from '../word/types'

export async function pickQuestion(
  types: QuestionType[],
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
  return { status: 'ok', draft: { question: createNewQuestion(type, lexes), lexes } }
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function pickWordCount(type: QuestionType, usageWordCount: number): number {
  if (
    type === 'WordExplain' ||
    type === 'UnaryProperty' ||
    type === 'BinaryAssociation' ||
    type === 'TernaryComposition'
  ) {
    return 1
  }
  if (type === 'WordsUsage') {
    return usageWordCount
  }
  if (type === 'TernaryIsolation') {
    return 3
  }
  return 2
}

function createNewQuestion(type: QuestionType, lexes: Lexis[]): NewQuestion {
  const [word1, word2, word3] = lexes
  switch (type) {
    case 'WordExplain':
    case 'UnaryProperty':
    case 'BinaryAssociation':
      return { type, wordId: word1.nodeId }
    case 'TernaryComposition':
      return { type, word3Id: word1.nodeId }
    case 'WordsUsage':
      return { type, wordIds: lexes.map(({ nodeId }) => nodeId) }
    case 'TernaryIsolation':
      return {
        type,
        word1Id: word1.nodeId,
        word2Id: word2.nodeId,
        word3Id: word3.nodeId,
      }
    case 'BinaryCommon':
    case 'BinaryDifference':
    case 'BinarySimilarity':
      return { type, word1Id: word1.nodeId, word2Id: word2.nodeId }
    case 'NamedAssociation':
      throw new Error('탐색에서 출제하지 않는 유형입니다')
  }
}
