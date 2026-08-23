import type { TernaryWords, WordKey, WordRelation } from './types'

export function readWordKeys(relation: WordRelation, keys: WordKey[]): number[] {
  const words = relation as Partial<TernaryWords>
  return keys.flatMap((key) => {
    const wordId = words[key]
    return wordId === undefined ? [] : [wordId]
  })
}
