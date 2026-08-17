import {
  DOCUMENTS_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
  WORD_META_STORE,
} from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { clearAndBackfillCountLogs, SourceStoreNames } from './backfillCountLogs'
import { CountStoreNames, CountStores, TimeUnits } from './consts'
import type { ChartMode, CountKind, CountLog, TimeUnit, Totals } from './types'
import { createBins, createEmptyLog, createLog, getBinDate } from './utils'

const TotalStoreNames = [WORD_META_STORE, SENTENCES_STORE, DOCUMENTS_STORE, RELATIONS_STORE]

export async function getTotals(): Promise<Totals> {
  const db = await openNoemaDB()
  return readTotals(db.transaction(TotalStoreNames))
}

export function recordCreation(db: IDBDatabase, kind: CountKind, amount: number = 1): void {
  recordCountChange(db, kind, amount)
}

export function recordDeletion(db: IDBDatabase, kind: CountKind, amount: number = 1): void {
  recordCountChange(db, kind, -amount)
}

export async function getCountLogs(unit: TimeUnit, mode: ChartMode): Promise<CountLog[]> {
  const bins = createBins(unit, new Date())
  const db = await openNoemaDB()
  const storeName = CountStores[unit][mode]
  const store = db.transaction(storeName).objectStore(storeName)
  const logs = await awaitRequest<CountLog[]>(store.getAll(IDBKeyRange.lowerBound(bins[0])))
  if (mode === 'delta') {
    return fillDeltaBins(bins, logs)
  }
  return fillAccBins(bins, logs, await getLastLogBefore(store, bins[0]))
}

export async function rebuildCountLogs(): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction([...SourceStoreNames, ...CountStoreNames], 'readwrite')
  await clearAndBackfillCountLogs(transaction)
  await awaitTransaction(transaction)
}

function recordCountChange(db: IDBDatabase, kind: CountKind, amount: number): void {
  const transaction = db.transaction([...TotalStoreNames, ...CountStoreNames], 'readwrite')
  void writeCountLogs(transaction, kind, amount)
}

async function writeCountLogs(
  transaction: IDBTransaction,
  kind: CountKind,
  amount: number,
): Promise<void> {
  const totals = await readTotals(transaction)
  const now = new Date()
  for (const unit of TimeUnits) {
    const beginDate = getBinDate(unit, now)
    const deltaStore = transaction.objectStore(CountStores[unit].delta)
    const stored = await awaitRequest<CountLog | undefined>(deltaStore.get(beginDate))
    const delta = stored ?? createEmptyLog(beginDate)
    delta[kind] += amount
    deltaStore.put(delta)
    transaction.objectStore(CountStores[unit].acc).put(createLog(beginDate, totals))
  }
}

async function readTotals(transaction: IDBTransaction): Promise<Totals> {
  const wordCount = await awaitRequest<number>(
    transaction.objectStore(WORD_META_STORE).get('wordSize'),
  )
  const sentenceCount = await awaitRequest<number>(
    transaction.objectStore(SENTENCES_STORE).count(),
  )
  const documentCount = await awaitRequest<number>(
    transaction.objectStore(DOCUMENTS_STORE).count(),
  )
  const relationCount = await awaitRequest<number>(
    transaction.objectStore(RELATIONS_STORE).count(),
  )
  return { wordCount, sentenceCount, documentCount, relationCount }
}

async function getLastLogBefore(
  store: IDBObjectStore,
  beginDate: Date,
): Promise<CountLog | undefined> {
  const cursor = await awaitRequest<IDBCursorWithValue | null>(
    store.openCursor(IDBKeyRange.upperBound(beginDate, true), 'prev'),
  )
  return cursor?.value
}

function fillDeltaBins(bins: Date[], logs: CountLog[]): CountLog[] {
  const logByTime = createLogMap(logs)
  return bins.map(
    (beginDate) => logByTime.get(beginDate.getTime()) ?? createEmptyLog(beginDate),
  )
}

function fillAccBins(
  bins: Date[],
  logs: CountLog[],
  lastBefore: CountLog | undefined,
): CountLog[] {
  const logByTime = createLogMap(logs)
  let carried = lastBefore ?? createEmptyLog(bins[0])
  return bins.map((beginDate) => {
    const log = logByTime.get(beginDate.getTime())
    if (!log) {
      return createLog(beginDate, carried)
    }
    carried = log
    return log
  })
}

function createLogMap(logs: CountLog[]): Map<number, CountLog> {
  return new Map(logs.map((log) => [log.beginDate.getTime(), log]))
}
