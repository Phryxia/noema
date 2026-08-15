import { parseBatchLines } from './parseBatchLines'
import { resolveWords } from './resolveWords'
import { submitNamedAssociations } from './submitNamedAssociations'
import type { BatchResultEntry } from './types'
import { computeCartesianProduct } from '../../utils/computeCartesianProduct'

export async function submitBatchRelations(texts: string[]): Promise<BatchResultEntry[]> {
  const lists = await resolveWords(texts.map(parseBatchLines))
  return submitNamedAssociations(computeCartesianProduct(lists))
}
