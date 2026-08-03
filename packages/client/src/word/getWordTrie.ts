import { ROOT_NODE_ID } from './consts'
import type { TrieNode } from './types'
import { WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'

export interface WordTrie {
  parents: Map<number, number>
  children: Map<number, number[]>
  wordNodeIds: number[]
}

export async function getWordTrie(): Promise<WordTrie> {
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const nodes = await awaitRequest<TrieNode[]>(nodeStore.getAll())

  const parents = new Map<number, number>()
  const children = new Map<number, number[]>()
  const wordNodeIds: number[] = []
  for (const node of nodes) {
    if (node.nodeId !== ROOT_NODE_ID) {
      parents.set(node.nodeId, node.parentNodeId ?? ROOT_NODE_ID)
    }
    if (node.createdAt) {
      wordNodeIds.push(node.nodeId)
    }
    const childIds = Object.values(node.children)
    if (childIds.length) {
      children.set(node.nodeId, childIds)
    }
  }
  return { parents, children, wordNodeIds }
}

export function getPathNodeIds(trie: WordTrie, wordNodeId: number): number[] {
  const path: number[] = []
  let current = wordNodeId
  while (current !== ROOT_NODE_ID) {
    path.push(current)
    current = trie.parents.get(current) ?? ROOT_NODE_ID
  }
  return path.reverse()
}
