import { CREATED_AT_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { RECENT_PAGE_SIZE } from './consts'
import type { RecentCursor, RecentEntry, RecentPage, RecentRange, RecentSource } from './types'

interface StoredEntry {
  value: string
  createdAt: Date
  source?: string
}

export async function getRecentPage<TEntry, TRow>(
  { storeName, toEntry, hydrate }: RecentSource<TEntry, TRow>,
  range: RecentRange,
  from: RecentCursor | null,
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
    from,
    toEntry,
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
  from: RecentCursor | null,
  toEntry: (id: number, stored: unknown) => TRow,
): Promise<RecentRowPage<TRow>> {
  return new Promise<RecentRowPage<TRow>>((resolve, reject) => {
    const rows: TRow[] = []
    let pendingJump = from

    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve({ rows, nextCursor: null })
        return
      }
      if (pendingJump) {
        const { createdAt, id } = pendingJump
        pendingJump = null
        cursor.continuePrimaryKey(createdAt, id)
        return
      }
      if (rows.length === RECENT_PAGE_SIZE) {
        resolve({ rows, nextCursor: toCursor(cursor) })
        return
      }
      rows.push(toEntry(cursor.primaryKey as number, cursor.value))
      cursor.continue()
    }

    request.onerror = (): void => reject(request.error)
  })
}

function toCursor(cursor: IDBCursorWithValue): RecentCursor {
  return { createdAt: cursor.key as Date, id: cursor.primaryKey as number }
}
