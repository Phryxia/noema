import {
  DOCUMENTS_STORE,
  RECENT_DOCUMENTS_STORE,
  RECENT_SENTENCES_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../db/consts'
import { createTitleSource } from '../db/documentTitle/createTitleSource'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { DocumentTitleRelation } from '../relation/types'
import { addSentences } from '../sentence/sentenceTx'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import { resolveDocumentTitleMap } from './resolveDocumentTitleMap'
import type { Document, RecentDocument, RecentDocumentSlot } from './types'

const RECENT_DOCUMENTS_SIZE = 4

export async function createDocument(
  title: string,
  value: string,
  source: string,
): Promise<number> {
  if (!title) {
    throw new Error('빈 문자열은 제목이 될 수 없다')
  }
  if (!value) {
    throw new Error('빈 문자열은 문서가 될 수 없다')
  }
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [
      DOCUMENTS_STORE,
      RECENT_DOCUMENTS_STORE,
      SENTENCES_STORE,
      RECENT_SENTENCES_STORE,
      RELATIONS_STORE,
    ],
    'readwrite',
  )
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)

  const createdAt = new Date()
  const documentId = (await awaitRequest<IDBValidKey>(
    documentStore.add(source ? { value, createdAt, source } : { value, createdAt }),
  )) as number

  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))
  const slot: RecentDocumentSlot = { documentId, createdAt }
  recentStore.put(slot, next)
  recentStore.put((next + 1) % RECENT_DOCUMENTS_SIZE, 'next')

  const [sentenceId] = await addSentences(
    transaction,
    [title],
    createTitleSource(documentId),
    createdAt,
  )
  const relation: Omit<DocumentTitleRelation, 'relationId'> = {
    type: 'DocumentTitle',
    documentId,
    sentenceId,
    createdAt,
  }
  transaction.objectStore(RELATIONS_STORE).add(relation)

  await awaitTransaction(transaction)
  recordCreation(db, 'documentCount')
  recordCreation(db, 'sentenceCount')
  recordCreation(db, 'relationCount')
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
  const transaction = db.transaction(DOCUMENTS_STORE, 'readwrite')
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

  await awaitTransaction(transaction)
}

export async function deleteDocument(documentId: number): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)
  const isExisting = !!(await awaitRequest<number>(documentStore.count(documentId)))
  documentStore.delete(documentId)

  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  await forEachRecentSlot(recentStore, documentId, (index) => recentStore.put(null, index))

  await awaitTransaction(transaction)
  if (isExisting) {
    recordDeletion(db, 'documentCount')
  }
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
  const slots = await readRecentSlots()
  const titleMap = await resolveDocumentTitleMap(slots.map((slot) => slot.documentId))
  return slots.map((slot) => ({ ...slot, title: titleMap.get(slot.documentId) || null }))
}

async function readRecentSlots(): Promise<RecentDocumentSlot[]> {
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RECENT_DOCUMENTS_STORE], 'readwrite')
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)
  const recentStore = transaction.objectStore(RECENT_DOCUMENTS_STORE)
  const next = await awaitRequest<number>(recentStore.get('next'))

  const slots: RecentDocumentSlot[] = []
  for (let offset = 1; offset <= RECENT_DOCUMENTS_SIZE; offset += 1) {
    const index = (next - offset + RECENT_DOCUMENTS_SIZE) % RECENT_DOCUMENTS_SIZE
    const slot = await awaitRequest<RecentDocumentSlot | null | undefined>(
      recentStore.get(index),
    )
    if (!slot) {
      continue
    }
    if (!(await awaitRequest<number>(documentStore.count(slot.documentId)))) {
      recentStore.put(null, index)
      continue
    }
    slots.push(slot)
  }

  await awaitTransaction(transaction)
  return slots
}

async function forEachRecentSlot(
  recentStore: IDBObjectStore,
  documentId: number,
  handle: (index: number) => void,
): Promise<void> {
  for (let index = 0; index < RECENT_DOCUMENTS_SIZE; index += 1) {
    const slot = await awaitRequest<RecentDocumentSlot | null | undefined>(
      recentStore.get(index),
    )
    if (slot?.documentId === documentId) {
      handle(index)
    }
  }
}
