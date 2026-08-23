import { DB_NAME, DB_VERSION, RELATIONS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { decodeValue, encodeValue } from './serialize'
import type { BackupEntry, NoemaBackup } from './types'

export async function exportBackup(): Promise<NoemaBackup> {
  const db = await openNoemaDB()
  const storeNames = Array.from(db.objectStoreNames)
  const transaction = db.transaction(storeNames)
  const stores: Record<string, BackupEntry[]> = {}
  for (const storeName of storeNames) {
    stores[storeName] = await readEntries(transaction.objectStore(storeName))
  }
  return {
    dbName: DB_NAME,
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    stores,
  }
}

export async function importBackup(backup: NoemaBackup): Promise<void> {
  const db = await openNoemaDB()
  const storeNames = Array.from(db.objectStoreNames)
  const transaction = db.transaction(storeNames, 'readwrite')
  storeNames.forEach((storeName) => {
    const store = transaction.objectStore(storeName)
    store.clear()
    backup.stores[storeName]?.forEach((entry) => writeEntry(store, entry))
  })
  await awaitTransaction(transaction)
}

async function readEntries(store: IDBObjectStore): Promise<BackupEntry[]> {
  const keys = await awaitRequest<IDBValidKey[]>(store.getAllKeys())
  const values = await awaitRequest<unknown[]>(store.getAll())
  return keys.map((key, index) => ({
    key: encodeValue(key),
    value: encodeValue(values[index]),
  }))
}

function writeEntry(store: IDBObjectStore, entry: BackupEntry): void {
  const value = decodeValue(entry.value)
  if (store.name === RELATIONS_STORE) {
    removeLegacyQuestionId(value)
  }
  if (!store.keyPath) {
    store.put(value, decodeValue(entry.key) as IDBValidKey)
    return
  }
  store.put(value)
}

function removeLegacyQuestionId(value: unknown): void {
  if (typeof value !== 'object' || value === null || !('questionId' in value)) {
    return
  }
  delete value.questionId
}
