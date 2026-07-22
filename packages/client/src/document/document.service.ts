import { DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE } from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import { deleteRelationsReferencing } from '../relation/relation.service'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import type { Document, RecentDocument } from './types'

const RECENT_DOCUMENTS_SIZE = 4
const PREVIEW_LENGTH = 64
const HIGH_SURROGATE_START = 0xd800
const HIGH_SURROGATE_END = 0xdbff

export async function createDocument(value: string, source: string): Promise<number> {
  if (!value) {
    throw new Error('빈 문자열은 문서가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)

  const createdAt = new Date()
  const documentId = (await awaitRequest<IDBValidKey>(
    documentStore.add(source ? { value, createdAt, source } : { value, createdAt }),
  )) as number

  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))
  const recentDocument: RecentDocument = {
    documentId,
    preview: createPreview(value),
    createdAt,
  }
  recentStore.put(recentDocument, next)
  recentStore.put((next + 1) % RECENT_DOCUMENTS_SIZE, 'next')

  await awaitTransaction(transaction)
  recordCreation(db, 'documentCount')
  return documentId
}

export async function updateDocument(
  documentId: number,
  value: string,
  source: string,
): Promise<void> {
  if (!value) {
    throw new Error('빈 문자열은 문서가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)

  const target = await awaitRequest<Document | undefined>(documentStore.get(documentId))
  if (!target) {
    await awaitTransaction(transaction)
    return
  }
  target.value = value
  target.modifiedAt = new Date()
  if (source) {
    target.source = source
  } else {
    delete target.source
  }
  documentStore.put(target)

  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  await forEachRecentSlot(recentStore, documentId, (slot, index) =>
    recentStore.put({ ...slot, preview: createPreview(value) }, index),
  )

  await awaitTransaction(transaction)
}

export async function deleteDocument(documentId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)
  const isExisting = !!(await awaitRequest<number>(documentStore.count(documentId)))
  documentStore.delete(documentId)

  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  await forEachRecentSlot(recentStore, documentId, (_slot, index) =>
    recentStore.put(null, index),
  )

  await awaitTransaction(transaction)
  if (isExisting) {
    recordDeletion(db, 'documentCount')
  }
  void deleteRelationsReferencing({ type: 'document', id: documentId })
}

export async function getDocument(documentId: number): Promise<Document | null> {
  if (!Number.isInteger(documentId)) {
    return null
  }
  const db = await openNoemaDB()
  const documentStore = db.transaction(DOCUMENTS_STORE).objectStore(DOCUMENTS_STORE)
  const target = await awaitRequest<Document | undefined>(documentStore.get(documentId))
  return target ?? null
}

export async function getRecentDocuments(): Promise<RecentDocument[]> {
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)
  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))

  const result: RecentDocument[] = []
  for (let offset = 1; offset <= RECENT_DOCUMENTS_SIZE; offset += 1) {
    const index = (next - offset + RECENT_DOCUMENTS_SIZE) % RECENT_DOCUMENTS_SIZE
    const slot = await awaitRequest<RecentDocument | null | undefined>(recentStore.get(index))
    if (!slot) {
      continue
    }
    if (!(await awaitRequest<number>(documentStore.count(slot.documentId)))) {
      recentStore.put(null, index)
      continue
    }
    result.push(slot)
  }

  await awaitTransaction(transaction)
  return result
}

async function forEachRecentSlot(
  recentStore: IDBObjectStore,
  documentId: number,
  handle: (slot: RecentDocument, index: number) => void,
): Promise<void> {
  for (let index = 0; index < RECENT_DOCUMENTS_SIZE; index += 1) {
    const slot = await awaitRequest<RecentDocument | null | undefined>(recentStore.get(index))
    if (slot?.documentId === documentId) {
      handle(slot, index)
    }
  }
}

function createPreview(value: string): string {
  const preview = value.slice(0, PREVIEW_LENGTH)
  const lastCharCode = preview.charCodeAt(preview.length - 1)
  if (lastCharCode >= HIGH_SURROGATE_START && lastCharCode <= HIGH_SURROGATE_END) {
    return preview.slice(0, -1)
  }
  return preview
}
