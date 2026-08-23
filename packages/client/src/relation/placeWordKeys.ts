import type { TernaryWords, WordKey } from './types'

export function placeWordKeys(keys: WordKey[], wordIds: number[]): Partial<TernaryWords> {
  const words: Partial<TernaryWords> = {}
  keys.forEach((key, index) => {
    const wordId = wordIds[index]
    if (wordId !== undefined) {
      words[key] = wordId
    }
  })
  return words
}
