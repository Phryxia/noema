import { RECENT_WORDS_STORE, WORD_META_STORE, WORD_NODES_STORE } from '../db/consts'
import { awaitRequest } from '../db/utils'
import { ROOT_NODE_ID } from './consts'
import type { RecentWord, TrieNode } from './types'

export interface AddedWord {
  nodeId: number
  isCreated: boolean
}

export async function addWord(
  transaction: IDBTransaction,
  value: string,
  createdAt: Date,
): Promise<AddedWord> {
  if (!value) {
    throw new Error('빈 문자열은 단어가 될 수 없다')
  }
  const node = await insertWordPath(transaction, value)
  if (node.createdAt) {
    return { nodeId: node.nodeId, isCreated: false }
  }
  await markAsWord(transaction, node.nodeId, createdAt)
  await pushRecentWord(transaction, { nodeId: node.nodeId, value, createdAt })
  return { nodeId: node.nodeId, isCreated: true }
}

export async function insertWordPath(
  transaction: IDBTransaction,
  value: string,
): Promise<TrieNode> {
  const metaStore = transaction.objectStore(WORD_META_STORE)
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  let nextNodeId = await awaitRequest<number>(metaStore.get('nextNodeId'))
  let createdCount = 0
  let node = await awaitRequest<TrieNode>(nodeStore.get(ROOT_NODE_ID))

  for (const char of value) {
    const childNodeId = node.children[char]
    if (childNodeId !== undefined) {
      node = await awaitRequest<TrieNode>(nodeStore.get(childNodeId))
      continue
    }
    const child: TrieNode = {
      nodeId: nextNodeId,
      parentNodeId: node.nodeId,
      value: char,
      children: {},
    }
    nextNodeId += 1
    createdCount += 1
    node.children[char] = child.nodeId
    nodeStore.put(node)
    nodeStore.put(child)
    node = child
  }

  if (createdCount) {
    metaStore.put(nextNodeId, 'nextNodeId')
    const trieNodeSize = await awaitRequest<number>(metaStore.get('trieNodeSize'))
    metaStore.put(trieNodeSize + createdCount, 'trieNodeSize')
  }
  return node
}

export async function markAsWord(
  transaction: IDBTransaction,
  nodeId: number,
  createdAt: Date,
  modifiedAt?: Date,
): Promise<void> {
  const metaStore = transaction.objectStore(WORD_META_STORE)
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  const node = await awaitRequest<TrieNode>(nodeStore.get(nodeId))
  node.createdAt = createdAt
  if (modifiedAt) {
    node.modifiedAt = modifiedAt
  }
  nodeStore.put(node)

  const wordSize = await awaitRequest<number>(metaStore.get('wordSize'))
  metaStore.put(wordSize + 1, 'wordSize')
}

export async function unmarkAndPrune(
  transaction: IDBTransaction,
  nodeId: number,
): Promise<boolean> {
  const metaStore = transaction.objectStore(WORD_META_STORE)
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  const node = await awaitRequest<TrieNode | undefined>(nodeStore.get(nodeId))
  if (!node?.createdAt) {
    return false
  }

  delete node.createdAt
  delete node.modifiedAt
  nodeStore.put(node)
  const wordSize = await awaitRequest<number>(metaStore.get('wordSize'))
  metaStore.put(wordSize - 1, 'wordSize')

  let current = node
  let removedCount = 0
  while (
    current.nodeId !== ROOT_NODE_ID &&
    !current.createdAt &&
    !Object.keys(current.children).length
  ) {
    const parent = await awaitRequest<TrieNode>(nodeStore.get(current.parentNodeId!))
    delete parent.children[current.value]
    nodeStore.delete(current.nodeId)
    nodeStore.put(parent)
    removedCount += 1
    current = parent
  }
  if (removedCount) {
    const trieNodeSize = await awaitRequest<number>(metaStore.get('trieNodeSize'))
    metaStore.put(trieNodeSize - removedCount, 'trieNodeSize')
  }
  return true
}

export async function pushRecentWord(
  transaction: IDBTransaction,
  recentWord: RecentWord,
): Promise<void> {
  const recentStore = transaction.objectStore(RECENT_WORDS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))
  recentStore.put(recentWord, next)
  recentStore.put((next + 1) % 10, 'next')
}

export async function hasRecentWord(
  transaction: IDBTransaction,
  nodeId: number,
): Promise<boolean> {
  const recentStore = transaction.objectStore(RECENT_WORDS_STORE)
  for (let index = 0; index < 10; index += 1) {
    const slot = await awaitRequest<RecentWord | null | undefined>(recentStore.get(index))
    if (slot?.nodeId === nodeId) {
      return true
    }
  }
  return false
}

export async function rewriteRecentSlots(
  transaction: IDBTransaction,
  fromNodeId: number,
  replacement: RecentWord | null,
): Promise<void> {
  const recentStore = transaction.objectStore(RECENT_WORDS_STORE)
  for (let index = 0; index < 10; index += 1) {
    const slot = await awaitRequest<RecentWord | null | undefined>(recentStore.get(index))
    if (slot?.nodeId === fromNodeId) {
      recentStore.put(replacement, index)
    }
  }
}

export async function walkToNode(
  nodeStore: IDBObjectStore,
  path: string,
): Promise<TrieNode | undefined> {
  let node = await awaitRequest<TrieNode | undefined>(nodeStore.get(ROOT_NODE_ID))
  for (const char of path) {
    const childNodeId = node?.children[char]
    if (childNodeId === undefined) {
      return undefined
    }
    node = await awaitRequest<TrieNode | undefined>(nodeStore.get(childNodeId))
  }
  return node
}
