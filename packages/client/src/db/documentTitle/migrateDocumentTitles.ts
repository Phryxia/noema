import {
  DOCUMENTS_STORE,
  RECENT_DOCUMENTS_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../consts'
import { clearAndBackfillCountLogs } from '../countLog/backfill'
import { checkIsStoredDocument } from './checkIsStoredDocument'
import type { StoredDocument } from './checkIsStoredDocument'
import { DOCUMENT_TITLE_RELATION_TYPE } from './consts'
import { createDefaultTitle } from './createDefaultTitle'
import { createTitleSource } from './createTitleSource'
import { mergeTitlesIntoRecentSentences } from './mergeTitlesIntoRecentSentences'

export async function migrateDocumentTitles(transaction: IDBTransaction): Promise<void> {
  removeRecentDocumentPreviews(transaction.objectStore(RECENT_DOCUMENTS_STORE))
  await addDefaultTitles(transaction)
  await mergeTitlesIntoRecentSentences(transaction)
  await clearAndBackfillCountLogs(transaction)
}

function removeRecentDocumentPreviews(recentStore: IDBObjectStore): void {
  recentStore.openCursor().onsuccess = (event): void => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
    if (!cursor) {
      return
    }
    const slot: unknown = cursor.value
    if (typeof slot === 'object' && slot !== null && 'preview' in slot) {
      delete slot.preview
      cursor.update(slot)
    }
    cursor.continue()
  }
}

function addDefaultTitles(transaction: IDBTransaction): Promise<void> {
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  return new Promise((resolve, reject) => {
    const request = transaction.objectStore(DOCUMENTS_STORE).openCursor()
    request.onerror = (): void => reject(request.error)
    request.onsuccess = (): void => {
      const cursor = request.result
      if (!cursor) {
        resolve()
        return
      }
      const document: unknown = cursor.value
      if (checkIsStoredDocument(document)) {
        addDefaultTitle(sentenceStore, relationStore, document)
      }
      cursor.continue()
    }
  })
}

function addDefaultTitle(
  sentenceStore: IDBObjectStore,
  relationStore: IDBObjectStore,
  document: StoredDocument,
): void {
  const { documentId } = document
  const createdAt = document.createdAt ?? new Date()
  const request = sentenceStore.add({
    value: createDefaultTitle(document.value, documentId),
    createdAt,
    source: createTitleSource(documentId),
  })
  request.onsuccess = (): void => {
    relationStore.add({
      type: DOCUMENT_TITLE_RELATION_TYPE,
      documentId,
      sentenceId: request.result,
      createdAt,
    })
  }
}
