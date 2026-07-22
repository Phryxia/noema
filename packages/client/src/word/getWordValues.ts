import { WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { TrieNode } from './types'

export async function getWordValues(nodeIds: number[]): Promise<string[]> {
  if (!nodeIds.length) {
    return []
  }
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const restored = new Map<number, string>()

  const values: string[] = []
  for (const nodeId of nodeIds) {
    values.push(await restoreValue(nodeStore, restored, nodeId))
  }
  return values
}

async function restoreValue(
  nodeStore: IDBObjectStore,
  restored: Map<number, string>,
  nodeId: number,
): Promise<string> {
  if (!nodeId) {
    return ''
  }
  const cached = restored.get(nodeId)
  if (cached !== undefined) {
    return cached
  }
  const node = await awaitRequest<TrieNode | undefined>(nodeStore.get(nodeId))
  if (!node) {
    return ''
  }
  const value = (await restoreValue(nodeStore, restored, node.parentNodeId ?? 0)) + node.value
  restored.set(nodeId, value)
  return value
}
