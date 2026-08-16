import { USAGE_WORDS_LABEL } from './consts'
import type { ExpressionToken } from './types'

export function createUsageFallbackTokens(
  answer: ExpressionToken,
  wordIds: number[],
): ExpressionToken[] {
  const words = wordIds.flatMap((wordId, index): ExpressionToken[] => {
    const word: ExpressionToken = { kind: 'word', id: wordId }
    if (!index) {
      return [word]
    }
    return [{ kind: 'text', value: ', ' }, word]
  })
  return [answer, { kind: 'text', value: USAGE_WORDS_LABEL }, ...words]
}
