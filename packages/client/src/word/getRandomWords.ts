import { CREATED_AT_INDEX, WORD_NODES_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { getWordCount } from './getWordCount'
import { getWordValues } from './getWordValues'
import type { Lexis } from './types'

export async function getRandomWords(n: number): Promise<Lexis[]> {
  const total = await getWordCount()
  const size = Math.min(n, total)
  if (!size) {
    return []
  }

  const db = await openNoemaDB()
  const nodeStore = db.transaction(WORD_NODES_STORE).objectStore(WORD_NODES_STORE)
  const ordered = await readNodeIdsAt(
    nodeStore.index(CREATED_AT_INDEX),
    pickDistinctOrders(size, total),
  )
  const nodeIds = shuffle(ordered)
  const values = await getWordValues(nodeIds)
  return nodeIds.map((nodeId, index) => ({ nodeId, value: values[index] }))
}

function pickDistinctOrders(size: number, total: number): number[] {
  const orders = new Set<number>()
  while (orders.size < size) {
    orders.add(Math.floor(Math.random() * total))
  }
  return Array.from(orders).sort((a, b) => a - b)
}

function shuffle(nodeIds: number[]): number[] {
  const shuffled = nodeIds.slice()
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

function readNodeIdsAt(index: IDBIndex, orders: number[]): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const nodeIds: number[] = []
    let position = 0
    let cursor = 0
    const request = index.openKeyCursor()

    request.onsuccess = (): void => {
      const keyCursor = request.result
      if (!keyCursor) {
        resolve(nodeIds)
        return
      }
      if (position === orders[cursor]) {
        nodeIds.push(keyCursor.primaryKey as number)
        cursor += 1
        if (cursor >= orders.length) {
          resolve(nodeIds)
          return
        }
      }
      const step = orders[cursor] - position
      position += step
      keyCursor.advance(step)
    }

    request.onerror = (): void => reject(request.error ?? new Error('단어를 뽑지 못했습니다'))
  })
}
