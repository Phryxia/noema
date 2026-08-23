import { DOCUMENTS_STORE, RELATIONS_STORE, SENTENCES_STORE, WORD_NODES_STORE } from '../consts'
import { createEmptyLog, createLog, getBinDate } from './binning'
import { CountKinds, CountStoreNames, CountStores, TimeUnits } from './consts'
import type { CountKind, CountLog, TimeUnit } from './types'

const SourceStores: Record<CountKind, string> = {
  wordCount: WORD_NODES_STORE,
  sentenceCount: SENTENCES_STORE,
  documentCount: DOCUMENTS_STORE,
  relationCount: RELATIONS_STORE,
}

export function clearAndBackfillCountLogs(transaction: IDBTransaction): Promise<void> {
  CountStoreNames.forEach((storeName) => transaction.objectStore(storeName).clear())
  return backfillCountLogs(transaction)
}

async function backfillCountLogs(transaction: IDBTransaction): Promise<void> {
  const binsByUnit: Record<TimeUnit, Map<number, CountLog>> = {
    hour: new Map(),
    day: new Map(),
    week: new Map(),
  }
  for (const kind of CountKinds) {
    await forEachCreatedAt(transaction.objectStore(SourceStores[kind]), (createdAt) => {
      TimeUnits.forEach((unit) => addToBin(binsByUnit[unit], unit, createdAt, kind))
    })
  }
  TimeUnits.forEach((unit) => writeUnit(transaction, unit, binsByUnit[unit]))
}

function forEachCreatedAt(
  store: IDBObjectStore,
  handle: (createdAt: Date) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.openCursor()
    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve()
        return
      }
      const createdAt = cursor.value?.createdAt
      if (createdAt) {
        handle(createdAt)
      }
      cursor.continue()
    }
    request.onerror = (): void => reject(request.error)
  })
}

function addToBin(
  bins: Map<number, CountLog>,
  unit: TimeUnit,
  createdAt: Date,
  kind: CountKind,
): void {
  const beginDate = getBinDate(unit, createdAt)
  const time = beginDate.getTime()
  const log = bins.get(time) ?? createEmptyLog(beginDate)
  log[kind] += 1
  bins.set(time, log)
}

function writeUnit(
  transaction: IDBTransaction,
  unit: TimeUnit,
  bins: Map<number, CountLog>,
): void {
  const deltaStore = transaction.objectStore(CountStores[unit].delta)
  const accStore = transaction.objectStore(CountStores[unit].acc)
  const totals = createEmptyLog(new Date(0))
  const logs = Array.from(bins.values()).sort(
    (a, b) => a.beginDate.getTime() - b.beginDate.getTime(),
  )
  logs.forEach((log) => {
    deltaStore.put(log)
    CountKinds.forEach((kind) => {
      totals[kind] += log[kind]
    })
    accStore.put(createLog(log.beginDate, totals))
  })
}
