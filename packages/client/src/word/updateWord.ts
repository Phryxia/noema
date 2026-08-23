import { WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { replaceWordReferences } from '../relation/replaceWordReferences'
import { recordDeletion } from '../statistic/statistic.service'
import { WordRewriteStoreNames } from './consts'
import type { TrieNode } from './types'
import {
  hasRecentWord,
  insertWordPath,
  markAsWord,
  rewriteRecentSlots,
  unmarkAndPrune,
  walkToNode,
} from './wordTx'

export type UpdateWordResult =
  | { type: 'noop' }
  | { type: 'merge-required' }
  | { type: 'renamed'; nodeId: number }
  | { type: 'merged'; nodeId: number }

export async function updateWord(
  nodeId: number,
  newValue: string,
  allowMerge = false,
): Promise<UpdateWordResult> {
  if (!newValue) {
    throw new Error('빈 문자열은 단어가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction(WordRewriteStoreNames, 'readwrite')
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  const sourceNode = await awaitRequest<TrieNode | undefined>(nodeStore.get(nodeId))
  if (!sourceNode?.createdAt) {
    throw new Error('존재하지 않는 단어는 수정할 수 없다')
  }

  const targetNode = await walkToNode(nodeStore, newValue)
  if (targetNode?.nodeId === nodeId) {
    await awaitTransaction(transaction)
    return { type: 'noop' }
  }
  if (targetNode?.createdAt && !allowMerge) {
    await awaitTransaction(transaction)
    return { type: 'merge-required' }
  }
  if (targetNode?.createdAt) {
    return mergeWord(db, transaction, nodeId, newValue, targetNode.nodeId, targetNode.createdAt)
  }
  return renameWord(transaction, nodeId, newValue, sourceNode.createdAt)
}

async function renameWord(
  transaction: IDBTransaction,
  sourceNodeId: number,
  newValue: string,
  createdAt: Date,
): Promise<UpdateWordResult> {
  const leaf = await insertWordPath(transaction, newValue)
  await markAsWord(transaction, leaf.nodeId, createdAt, new Date())
  await unmarkAndPrune(transaction, sourceNodeId)
  await replaceWordReferences(transaction, sourceNodeId, leaf.nodeId)
  await rewriteRecentSlots(transaction, sourceNodeId, {
    nodeId: leaf.nodeId,
    value: newValue,
    createdAt,
  })
  await awaitTransaction(transaction)
  return { type: 'renamed', nodeId: leaf.nodeId }
}

async function mergeWord(
  db: IDBDatabase,
  transaction: IDBTransaction,
  sourceNodeId: number,
  newValue: string,
  targetNodeId: number,
  targetCreatedAt: Date,
): Promise<UpdateWordResult> {
  await replaceWordReferences(transaction, sourceNodeId, targetNodeId)

  const hasTargetSlot = await hasRecentWord(transaction, targetNodeId)
  const replacement = hasTargetSlot
    ? null
    : { nodeId: targetNodeId, value: newValue, createdAt: targetCreatedAt }
  await rewriteRecentSlots(transaction, sourceNodeId, replacement)

  await unmarkAndPrune(transaction, sourceNodeId)
  await awaitTransaction(transaction)
  recordDeletion(db, 'wordCount')
  return { type: 'merged', nodeId: targetNodeId }
}
