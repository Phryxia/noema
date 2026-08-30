import {
  DB_VERSION,
  DOCUMENT_TITLE_VERSION,
  DOCUMENTS_STORE,
  LEGACY_QUESTIONS_STORE,
  QUESTION_REMOVAL_VERSION,
  RECENT_DOCUMENTS_STORE,
  RECENT_SENTENCES_SIZE,
  RECENT_SENTENCES_STORE,
  RECENT_TITLE_SENTENCES_VERSION,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../db/consts'
import { checkIsStoredDocument } from '../db/documentTitle/checkIsStoredDocument'
import { checkIsStoredSentence } from '../db/documentTitle/checkIsStoredSentence'
import type { StoredSentence } from '../db/documentTitle/checkIsStoredSentence'
import { DOCUMENT_TITLE_RELATION_TYPE } from '../db/documentTitle/consts'
import { createDefaultTitle } from '../db/documentTitle/createDefaultTitle'
import { createTitleSource } from '../db/documentTitle/createTitleSource'
import { mergeRecentSentences, readQueueOrder } from '../db/documentTitle/mergeRecentSentences'
import { DATE_TAG } from './consts'
import type { BackupEntry, NoemaBackup } from './types'

export function upgradeBackup(backup: NoemaBackup): NoemaBackup {
  if (backup.version >= DB_VERSION) {
    return backup
  }
  const stores = { ...backup.stores }
  if (backup.version < QUESTION_REMOVAL_VERSION) {
    delete stores[LEGACY_QUESTIONS_STORE]
    stores[RELATIONS_STORE] = (stores[RELATIONS_STORE] ?? []).map((entry) =>
      omitValueKey(entry, 'questionId'),
    )
  }
  if (backup.version < DOCUMENT_TITLE_VERSION) {
    addDocumentTitleEntries(stores)
    stores[RECENT_DOCUMENTS_STORE] = (stores[RECENT_DOCUMENTS_STORE] ?? []).map((entry) =>
      omitValueKey(entry, 'preview'),
    )
  }
  if (backup.version < RECENT_TITLE_SENTENCES_VERSION) {
    mergeTitlesIntoRecentSentences(stores)
  }
  return { ...backup, version: DB_VERSION, stores }
}

function addDocumentTitleEntries(stores: Record<string, BackupEntry[]>): void {
  const sentences = (stores[SENTENCES_STORE] ?? []).slice()
  const relations = (stores[RELATIONS_STORE] ?? []).slice()
  let sentenceId = getNextKey(sentences)
  let relationId = getNextKey(relations)
  for (const entry of stores[DOCUMENTS_STORE] ?? []) {
    const document = entry.value
    if (!checkIsStoredDocument(document)) {
      continue
    }
    const { documentId, createdAt } = document
    sentences.push({
      key: sentenceId,
      value: {
        sentenceId,
        value: createDefaultTitle(document.value, documentId),
        createdAt,
        source: createTitleSource(documentId),
      },
    })
    relations.push({
      key: relationId,
      value: {
        relationId,
        type: DOCUMENT_TITLE_RELATION_TYPE,
        documentId,
        sentenceId,
        createdAt,
      },
    })
    sentenceId += 1
    relationId += 1
  }
  stores[SENTENCES_STORE] = sentences
  stores[RELATIONS_STORE] = relations
}

function mergeTitlesIntoRecentSentences(stores: Record<string, BackupEntry[]>): void {
  const titleSentenceIds = new Set<number>()
  for (const { value } of stores[RELATIONS_STORE] ?? []) {
    if (checkIsTitleRelation(value)) {
      titleSentenceIds.add(value.sentenceId)
    }
  }
  const titles = (stores[SENTENCES_STORE] ?? [])
    .map((entry) => entry.value)
    .filter(checkIsStoredSentence)
    .filter((sentence) => titleSentenceIds.has(sentence.sentenceId))
  if (!titles.length) {
    return
  }
  const existing = readRecentSentenceEntries(stores[RECENT_SENTENCES_STORE] ?? [])
  const { slots, next } = mergeRecentSentences(existing, titles, toEncodedDateSortKey)
  stores[RECENT_SENTENCES_STORE] = [
    ...slots.map((slot, key): BackupEntry => ({ key, value: slot })),
    { key: 'next', value: next },
  ]
}

function readRecentSentenceEntries(entries: BackupEntry[]): StoredSentence[] {
  const slots: (StoredSentence | null)[] = Array.from(
    { length: RECENT_SENTENCES_SIZE },
    () => null,
  )
  let next = 0
  for (const { key, value } of entries) {
    if (key === 'next' && typeof value === 'number') {
      next = value
    }
    if (
      typeof key === 'number' &&
      key < RECENT_SENTENCES_SIZE &&
      checkIsStoredSentence(value)
    ) {
      slots[key] = value
    }
  }
  return readQueueOrder(slots, next)
}

function checkIsTitleRelation(value: unknown): value is { sentenceId: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === DOCUMENT_TITLE_RELATION_TYPE &&
    'sentenceId' in value &&
    typeof value.sentenceId === 'number'
  )
}

function toEncodedDateSortKey(createdAt: unknown): string {
  if (typeof createdAt !== 'object' || createdAt === null || !(DATE_TAG in createdAt)) {
    return ''
  }
  return String(createdAt[DATE_TAG])
}

function getNextKey(entries: BackupEntry[]): number {
  const keys = entries
    .map((entry) => entry.key)
    .filter((key): key is number => typeof key === 'number')
  return keys.length ? Math.max(...keys) + 1 : 1
}

function omitValueKey(entry: BackupEntry, key: string): BackupEntry {
  const { value } = entry
  if (typeof value !== 'object' || value === null || !(key in value)) {
    return entry
  }
  const rest: Record<string, unknown> = { ...value }
  delete rest[key]
  return { ...entry, value: rest }
}
