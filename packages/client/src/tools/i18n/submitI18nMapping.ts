import type { ColumnPair } from './computeMappingTuples'
import { computeMappingTuples } from './computeMappingTuples'
import { submitNamedAssociation } from '../../relation/batch/submitNamedAssociation'
import type { ResolvedWord } from '../../qna/types'
import { upsertWord } from '../../word/word.service'

export interface I18nMappingResult {
  newWords: string[]
  relationCount: number
}

export async function submitI18nMapping(
  matrix: string[][],
  columnPairs?: ColumnPair[] | null,
): Promise<I18nMappingResult> {
  const { resolvedWords, newWords } = await resolveMatrixWords(matrix)
  let relationCount = 0
  for (const tuple of computeMappingTuples(matrix, columnPairs)) {
    const entry = await submitNamedAssociation(tuple.map((value) => resolvedWords.get(value)!))
    if (entry.outcome.kind === 'success') {
      relationCount += 1
    }
  }
  return { newWords, relationCount }
}

async function resolveMatrixWords(matrix: string[][]): Promise<{
  resolvedWords: Map<string, ResolvedWord>
  newWords: string[]
}> {
  const resolvedWords = new Map<string, ResolvedWord>()
  const newWords: string[] = []
  for (const row of matrix) {
    for (const value of row) {
      if (!value || resolvedWords.has(value)) {
        continue
      }
      const { nodeId, isCreated } = await upsertWord(value)
      resolvedWords.set(value, { wordId: nodeId, value })
      if (isCreated) {
        newWords.push(value)
      }
    }
  }
  return { resolvedWords, newWords }
}
