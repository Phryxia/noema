import { RECENT_WORDS_STORE, WORD_META_STORE, WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import type { Lexis, RecentWord, TrieNode } from './types'
import {
  insertWordPath,
  markAsWord,
  pushRecentWord,
  rewriteRecentSlots,
  unmarkAndPrune,
  walkToNode,
} from './wordTx'

export async function createWord(value: string): Promise<number> {
  if (!value) {
    throw new Error('빈 문자열은 단어가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE],
    'readwrite',
  )

  const node = await insertWordPath(transaction, value)
  if (node.createdAt) {
    await awaitTransaction(transaction)
    return node.nodeId
  }

  const createdAt = new Date()
  await markAsWord(transaction, node.nodeId, createdAt)
  await pushRecentWord(transaction, { nodeId: node.nodeId, value, createdAt })

  await awaitTransaction(transaction)
  recordCreation(db, 'wordCount')
  return node.nodeId
}

export async function deleteWord(nodeId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [WORD_META_STORE, WORD_NODES_STORE, RECENT_WORDS_STORE],
    'readwrite',
  )

  const wasWord = await unmarkAndPrune(transaction, nodeId)
  if (!wasWord) {
    await awaitTransaction(transaction)
    return
  }
  await rewriteRecentSlots(transaction, nodeId, null)

  await awaitTransaction(transaction)
  recordDeletion(db, 'wordCount')
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
