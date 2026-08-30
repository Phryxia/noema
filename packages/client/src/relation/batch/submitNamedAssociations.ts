import type { BatchResultEntry } from './types'
import { submitNamedAssociation } from './submitNamedAssociation'
import type { ResolvedWord } from '../../qna/types'

export async function submitNamedAssociations(
  tuples: ResolvedWord[][],
): Promise<BatchResultEntry[]> {
  const entries: BatchResultEntry[] = []
  for (const tuple of tuples) {
    entries.push(await submitNamedAssociation(tuple))
  }
  if (entries.length && entries.every((entry) => entry.outcome.kind === 'duplicate')) {
    throw new Error('모든 관계가 이미 있습니다')
  }
  return entries
}
