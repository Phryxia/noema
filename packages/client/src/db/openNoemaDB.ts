import {
  DAY_ACC_STORE,
  DAY_DELTA_STORE,
  DB_NAME,
  DB_VERSION,
  DOCUMENTS_STORE,
  HOUR_ACC_STORE,
  HOUR_DELTA_STORE,
  LEGACY_QUESTIONS_STORE,
  QUESTION_REMOVAL_VERSION,
  RECENT_DOCUMENTS_STORE,
  RECENT_SENTENCES_STORE,
  RECENT_WORDS_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
  WEEK_ACC_STORE,
  WEEK_DELTA_STORE,
  WORD_META_STORE,
  WORD_NODES_STORE,
} from './consts'
import { IndexSpecs } from './indexSpecs'
import { clearAndBackfillCountLogs } from '../statistic/backfillCountLogs'

const RELATION_COUNT_VERSION = 9

let dbPromise: Promise<IDBDatabase> | undefined

export function openNoemaDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = createConnection()
  }
  return dbPromise
}

function createConnection(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event): void => {
      const db = request.result
      const transaction = request.transaction
      if (!transaction) {
        return
      }
      switch (event.oldVersion) {
        case 0:
          createInitialSchema(db, transaction)
        case 1:
          createCountLogSchema(db)
      }
      ensureIndexes(transaction)
      if (event.oldVersion < RELATION_COUNT_VERSION) {
        void clearAndBackfillCountLogs(transaction)
      }
      if (event.oldVersion < QUESTION_REMOVAL_VERSION) {
        removeQuestions(db, transaction)
      }
    }

    request.onsuccess = (): void => {
      const db = request.result
      db.onversionchange = (): void => {
        db.close()
        dbPromise = undefined
      }
      resolve(db)
    }

    request.onerror = (): void => {
      dbPromise = undefined
      reject(request.error ?? new Error('Indexed DB를 열 수 없습니다'))
    }

    request.onblocked = (): void => {
      dbPromise = undefined
      reject(new Error('다른 탭이 구버전 DB 연결을 붙들고 있습니다. 다른 탭을 닫아주세요'))
    }
  })
}

function createInitialSchema(db: IDBDatabase, transaction: IDBTransaction): void {
  db.createObjectStore(WORD_META_STORE)
  db.createObjectStore(WORD_NODES_STORE, { keyPath: 'nodeId' })
  db.createObjectStore(RECENT_WORDS_STORE)
  db.createObjectStore(SENTENCES_STORE, { keyPath: 'sentenceId', autoIncrement: true })
  db.createObjectStore(RECENT_SENTENCES_STORE)
  db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'documentId', autoIncrement: true })
  db.createObjectStore(RECENT_DOCUMENTS_STORE)
  db.createObjectStore(RELATIONS_STORE, { keyPath: 'relationId', autoIncrement: true })

  const wordMeta = transaction.objectStore(WORD_META_STORE)
  wordMeta.put(1, 'trieNodeSize')
  wordMeta.put(0, 'wordSize')
  wordMeta.put(1, 'nextNodeId')

  transaction.objectStore(WORD_NODES_STORE).put({ nodeId: 0, value: '', children: {} })

  transaction.objectStore(RECENT_WORDS_STORE).put(0, 'next')
  transaction.objectStore(RECENT_SENTENCES_STORE).put(0, 'next')
  transaction.objectStore(RECENT_DOCUMENTS_STORE).put(0, 'next')
}

function removeQuestions(db: IDBDatabase, transaction: IDBTransaction): void {
  if (db.objectStoreNames.contains(LEGACY_QUESTIONS_STORE)) {
    db.deleteObjectStore(LEGACY_QUESTIONS_STORE)
  }
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  relationStore.openCursor().onsuccess = (event): void => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
    if (!cursor) {
      return
    }
    const relation: unknown = cursor.value
    if (typeof relation === 'object' && relation !== null && 'questionId' in relation) {
      delete relation.questionId
      cursor.update(relation)
    }
    cursor.continue()
  }
}

function ensureIndexes(transaction: IDBTransaction): void {
  IndexSpecs.forEach(({ storeName, name, keyPath, options }) => {
    const store = transaction.objectStore(storeName)
    if (store.indexNames.contains(name)) {
      return
    }
    store.createIndex(name, keyPath, options)
  })
}

function createCountLogSchema(db: IDBDatabase): void {
  const stores = [
    HOUR_DELTA_STORE,
    HOUR_ACC_STORE,
    DAY_DELTA_STORE,
    DAY_ACC_STORE,
    WEEK_DELTA_STORE,
    WEEK_ACC_STORE,
  ]
  stores.forEach((store) => db.createObjectStore(store, { keyPath: 'beginDate' }))
}
