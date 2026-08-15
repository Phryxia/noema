import { computeAdjacentPairs } from './computeAdjacentPairs'
import { NEXT_RELATION_NAME } from './consts'
import { resolveWords } from '../../relation/batch/resolveWords'
import { submitNamedAssociations } from '../../relation/batch/submitNamedAssociations'
import type { BatchResultEntry } from '../../relation/batch/types'

export async function submitOrdering(words: string[]): Promise<BatchResultEntry[]> {
  const [orderedWords, [nextWord]] = await resolveWords([
    words.filter(Boolean),
    [NEXT_RELATION_NAME],
  ])
  const tuples = computeAdjacentPairs(orderedWords).map((pair) => pair.concat(nextWord))
  return submitNamedAssociations(tuples)
}
