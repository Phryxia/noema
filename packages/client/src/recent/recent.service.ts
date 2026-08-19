import { CREATED_AT_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { createRowJudge } from './createRowJudge'
import type {
  RecentCursor,
  RecentEntry,
  RecentFilter,
  RecentPage,
  RecentRange,
  RecentSource,
  RecentStart,
} from './types'

interface StoredEntry {
  value: string
  createdAt: Date
  source?: string
}

export async function getRecentPage<TEntry, TRow>(
  { storeName, toEntry, hydrate }: RecentSource<TEntry, TRow>,
  range: RecentRange,
  start: RecentStart,
  filter?: RecentFilter<TRow>,
): Promise<RecentPage<TEntry>> {
  const keyRange = createKeyRange(range)
  if (!keyRange) {
    return { entries: [], nextCursor: null }
  }
  const db = await openNoemaDB()
  const store = db.transaction(storeName).objectStore(storeName)
  if (!store.indexNames.contains(CREATED_AT_INDEX)) {
    throw new Error(
      `${storeName}에 ${CREATED_AT_INDEX} 인덱스가 없습니다. 열려 있는 DB가 버전 ${db.version}입니다. 이 앱을 띄운 다른 탭을 모두 닫고 새로고침해주세요`,
    )
  }
  const page = await readPage(
    store.index(CREATED_AT_INDEX).openCursor(keyRange, 'prev'),
    start,
    toEntry,
    filter?.accept,
  )
  if (!hydrate) {
    return { entries: page.rows as unknown as TEntry[], nextCursor: page.nextCursor }
  }
  return { entries: await hydrate(page.rows), nextCursor: page.nextCursor }
}

export function toRecentEntry(id: number, stored: unknown): RecentEntry {
  const { value, createdAt, source } = stored as StoredEntry
  return { id, value, createdAt, source }
}

function createKeyRange({ since, until }: RecentRange): IDBKeyRange | null {
  if (!since) {
    return IDBKeyRange.upperBound(until)
  }
  if (since.getTime() > until.getTime()) {
    return null
  }
  return IDBKeyRange.bound(since, until)
}

interface RecentRowPage<TRow> {
  rows: TRow[]
  nextCursor: RecentCursor | null
}

function readPage<TRow>(
  request: IDBRequest<IDBCursorWithValue | null>,
  start: RecentStart,
  toEntry: (id: number, stored: unknown) => TRow,
  accept?: (row: TRow) => boolean,
): Promise<RecentRowPage<TRow>> {
  return new Promise<RecentRowPage<TRow>>((resolve, reject) => {
    const rows: TRow[] = []
    const judge = createRowJudge(start, accept)
    let pendingStart: RecentStart | null = checkNeedsJump(start, !!accept) ? start : null

    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve({ rows, nextCursor: null })
        return
      }
      if (pendingStart) {
        jumpToStart(cursor, pendingStart)
        pendingStart = null
        return
      }
      const row = toEntry(cursor.primaryKey as number, cursor.value)
      const verdict = judge(row, rows.length)
      if (verdict === 'stop') {
        resolve({ rows, nextCursor: toCursor(cursor) })
        return
      }
      if (verdict === 'collect') {
        rows.push(row)
      }
      cursor.continue()
    }

    request.onerror = (): void => reject(request.error)
  })
}

function checkNeedsJump(start: RecentStart, hasFilter: boolean): boolean {
  if (start.kind === 'cursor') {
    return true
  }
  return !hasFilter && !!start.offset
}

function jumpToStart(cursor: IDBCursorWithValue, start: RecentStart): void {
  if (start.kind === 'cursor') {
    cursor.continuePrimaryKey(start.cursor.createdAt, start.cursor.id)
    return
  }
  cursor.advance(start.offset)
}

function toCursor(cursor: IDBCursorWithValue): RecentCursor {
  return { createdAt: cursor.key as Date, id: cursor.primaryKey as number }
}
