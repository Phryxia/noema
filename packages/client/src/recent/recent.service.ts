import { CREATED_AT_INDEX } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { RECENT_PAGE_SIZE } from './consts'
import type { RecentCursor, RecentEntry, RecentPage, RecentRange } from './types'

interface StoredEntry {
  value: string
  createdAt: Date
  source?: string
}

export async function getRecentPage(
  storeName: string,
  range: RecentRange,
  from: RecentCursor | null,
): Promise<RecentPage> {
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
  return readPage(store.index(CREATED_AT_INDEX).openCursor(keyRange, 'prev'), from)
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

function readPage(
  request: IDBRequest<IDBCursorWithValue | null>,
  from: RecentCursor | null,
): Promise<RecentPage> {
  return new Promise<RecentPage>((resolve, reject) => {
    const entries: RecentEntry[] = []
    let pendingJump = from

    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve({ entries, nextCursor: null })
        return
      }
      if (pendingJump) {
        const { createdAt, id } = pendingJump
        pendingJump = null
        cursor.continuePrimaryKey(createdAt, id)
        return
      }
      if (entries.length === RECENT_PAGE_SIZE) {
        resolve({ entries, nextCursor: toCursor(cursor) })
        return
      }
      entries.push(toEntry(cursor))
      cursor.continue()
    }

    request.onerror = (): void => reject(request.error)
  })
}

function toCursor(cursor: IDBCursorWithValue): RecentCursor {
  return { createdAt: cursor.key as Date, id: cursor.primaryKey as number }
}

function toEntry(cursor: IDBCursorWithValue): RecentEntry {
  const { value, createdAt, source } = cursor.value as StoredEntry
  return { id: cursor.primaryKey as number, value, createdAt, source }
}
