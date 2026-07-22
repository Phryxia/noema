import { RECENT_WORDS_STORE, WORD_META_STORE, WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { deleteRelationsReferencing } from '../relation/relation.service'
import type { Lexis, RecentWord, TrieNode } from './types'

export async function createWord(value: string): Promise<number> {
  if (!value) {
    throw new Error('빈 문자열은 단어가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE],
    'readwrite',
  )
  const metaStore = transaction.objectStore(WORD_META_STORE)
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  let nextNodeId = await awaitRequest<number>(metaStore.get('nextNodeId'))
  let createdCount = 0
  let node = await awaitRequest<TrieNode>(nodeStore.get(0))

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

  if (node.createdAt) {
    await awaitTransaction(transaction)
    return node.nodeId
  }

  node.createdAt = new Date()
  nodeStore.put(node)

  if (createdCount) {
    metaStore.put(nextNodeId, 'nextNodeId')
    const trieNodeSize = await awaitRequest<number>(metaStore.get('trieNodeSize'))
    metaStore.put(trieNodeSize + createdCount, 'trieNodeSize')
  }
  const wordSize = await awaitRequest<number>(metaStore.get('wordSize'))
  metaStore.put(wordSize + 1, 'wordSize')

  const recentStore = transaction.objectStore(RECENT_WORDS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))
  const recentWord: RecentWord = { nodeId: node.nodeId, value, createdAt: node.createdAt }
  recentStore.put(recentWord, next)
  recentStore.put((next + 1) % 10, 'next')

  await awaitTransaction(transaction)
  return node.nodeId
}

export async function deleteWord(nodeId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE],
    'readwrite',
  )
  const metaStore = transaction.objectStore(WORD_META_STORE)
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  const node = await awaitRequest<TrieNode | undefined>(nodeStore.get(nodeId))
  if (!node?.createdAt) {
    await awaitTransaction(transaction)
    return
  }

  delete node.createdAt
  nodeStore.put(node)
  const wordSize = await awaitRequest<number>(metaStore.get('wordSize'))
  metaStore.put(wordSize - 1, 'wordSize')

  let current = node
  let removedCount = 0
  while (current.nodeId !== 0 && !current.createdAt && !Object.keys(current.children).length) {
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

  const recentStore = transaction.objectStore(RECENT_WORDS_STORE)
  for (let index = 0; index < 10; index += 1) {
    const slot = await awaitRequest<RecentWord | null | undefined>(recentStore.get(index))
    if (slot?.nodeId === nodeId) {
      recentStore.put(null, index)
    }
  }

  await awaitTransaction(transaction)
  void deleteRelationsReferencing({ type: 'word', id: nodeId })
}

export async function getWordNodeId(word: string): Promise<number | null> {
  const node = await getWordNode(word)
  return node?.nodeId ?? null
}

export async function getWordNode(word: string): Promise<TrieNode | null> {
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const node = await walkToNode(nodeStore, word)
  if (!node?.createdAt) {
    return null
  }
  return node
}

export async function getWordsByPrefix(prefix: string, n: number): Promise<Lexis[]> {
  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const prefixNode = await walkToNode(nodeStore, prefix)
  if (!prefixNode) {
    return []
  }

  const result: Lexis[] = []
  const stack: Lexis[] = [{ nodeId: prefixNode.nodeId, value: prefix }]
  while (stack.length && result.length < n) {
    const { nodeId, value } = stack.pop()!
    const node = await awaitRequest<TrieNode>(nodeStore.get(nodeId))
    if (node.createdAt) {
      result.push({ nodeId, value })
    }
    Object.entries(node.children)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([char, childNodeId]) =>
        stack.push({ nodeId: childNodeId, value: value + char }),
      )
  }
  return result
}

export async function getRecentWords(): Promise<RecentWord[]> {
  const db = await openNoemaDB()
  const recentStore = db.transaction(RECENT_WORDS_STORE).objectStore(RECENT_WORDS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))

  const result: RecentWord[] = []
  for (let offset = 1; offset <= 10; offset += 1) {
    const slot = await awaitRequest<RecentWord | null | undefined>(
      recentStore.get((next - offset + 10) % 10),
    )
    if (slot) {
      result.push(slot)
    }
  }
  return result
}

async function walkToNode(
  nodeStore: IDBObjectStore,
  path: string,
): Promise<TrieNode | undefined> {
  let node = await awaitRequest<TrieNode | undefined>(nodeStore.get(0))
  for (const char of path) {
    const childNodeId = node?.children[char]
    if (childNodeId === undefined) {
      return undefined
    }
    node = await awaitRequest<TrieNode | undefined>(nodeStore.get(childNodeId))
  }
  return node
}
