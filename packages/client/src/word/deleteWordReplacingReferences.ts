import { WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitTransaction } from '../db/utils'
import { replaceWordReferences } from '../relation/replaceWordReferences'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import { WordRewriteStoreNames } from './consts'
import {
  insertWordPath,
  markAsWord,
  pushRecentWord,
  rewriteRecentSlots,
  unmarkAndPrune,
  walkToNode,
} from './wordTx'

export async function deleteWordReplacingReferences(
  nodeId: number,
  replacementValue: string,
): Promise<void> {
  if (!replacementValue) {
    throw new Error('빈 문자열은 단어가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction(WordRewriteStoreNames, 'readwrite')
  const nodeStore = transaction.objectStore(WORD_NODES_STORE)

  const replacementNode = await walkToNode(nodeStore, replacementValue)
  if (replacementNode?.nodeId === nodeId) {
    throw new Error('삭제할 단어 자신으로는 대체할 수 없다')
  }

  const isCreated = !replacementNode?.createdAt
  const replacementNodeId = replacementNode?.createdAt
    ? replacementNode.nodeId
    : await createReplacementWord(transaction, replacementValue)

  await replaceWordReferences(transaction, nodeId, replacementNodeId)
  await unmarkAndPrune(transaction, nodeId)
  await rewriteRecentSlots(transaction, nodeId, null)

  await awaitTransaction(transaction)
  if (isCreated) {
    recordCreation(db, 'wordCount')
  }
  recordDeletion(db, 'wordCount')
}

async function createReplacementWord(
  transaction: IDBTransaction,
  value: string,
): Promise<number> {
  const leaf = await insertWordPath(transaction, value)
  const createdAt = new Date()
  await markAsWord(transaction, leaf.nodeId, createdAt)
  await pushRecentWord(transaction, { nodeId: leaf.nodeId, value, createdAt })
  return leaf.nodeId
}
