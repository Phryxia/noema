import type { ResolvedWord } from '../../qna/types'
import { createWord } from '../../word/word.service'

export async function resolveWords(lists: string[][]): Promise<ResolvedWord[][]> {
  const wordIdMap = new Map<string, number>()
  const resolved: ResolvedWord[][] = []
  for (const list of lists) {
    const words: ResolvedWord[] = []
    for (const value of list) {
      const wordId = wordIdMap.get(value) ?? (await createWord(value))
      wordIdMap.set(value, wordId)
      words.push({ wordId, value })
    }
    resolved.push(words)
  }
  return resolved
}
