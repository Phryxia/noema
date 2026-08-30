import {
  DOCUMENT_ID_INDEX,
  RECENT_SENTENCES_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../db/consts'
import { createTitleSource } from '../db/documentTitle/createTitleSource'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest, awaitTransaction } from '../db/utils'
import type { DocumentTitleRelation, Relation } from '../relation/types'
import { updateSentence } from '../sentence/sentence.service'
import { addSentences } from '../sentence/sentenceTx'
import type { Sentence } from '../sentence/types'
import { recordCreation, recordDeletion } from '../statistic/statistic.service'
import { checkIsDocumentTitleRelation } from './checkIsDocumentTitleRelation'
import type { DocumentTitleEntry } from './types'

interface FoundTitle {
  title: DocumentTitleEntry | null
  danglingRelationIds: number[]
}

export async function getDocumentTitle(documentId: number): Promise<DocumentTitleEntry | null> {
  if (!Number.isInteger(documentId)) {
    return null
  }
  const { title } = await findDocumentTitle(documentId)
  return title
}

export async function saveDocumentTitle(documentId: number, title: string): Promise<void> {
  if (!title) {
    throw new Error('빈 문자열은 제목이 될 수 없다')
  }
  const found = await findDocumentTitle(documentId)
  if (found.title) {
    const { sentence } = found.title
    if (sentence.value === title) {
      return
    }
    await updateSentence(
      sentence.sentenceId,
      title,
      sentence.source ?? createTitleSource(documentId),
    )
    return
  }
  await restoreDocumentTitle(documentId, title, found.danglingRelationIds)
}

async function findDocumentTitle(documentId: number): Promise<FoundTitle> {
  const db = await openNoemaDB()
  const transaction = db.transaction([RELATIONS_STORE, SENTENCES_STORE])
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const relations = await awaitRequest<Relation[]>(
    relationStore.index(DOCUMENT_ID_INDEX).getAll(documentId),
  )
  const danglingRelationIds: number[] = []
  for (const relation of relations.filter(checkIsDocumentTitleRelation)) {
    const sentence = await awaitRequest<Sentence | undefined>(
      sentenceStore.get(relation.sentenceId),
    )
    if (sentence) {
      return { title: { relationId: relation.relationId, sentence }, danglingRelationIds }
    }
    danglingRelationIds.push(relation.relationId)
  }
  return { title: null, danglingRelationIds }
}

async function restoreDocumentTitle(
  documentId: number,
  title: string,
  danglingRelationIds: number[],
): Promise<void> {
  const db = await openNoemaDB()
  const transaction = db.transaction(
    [SENTENCES_STORE, RECENT_SENTENCES_STORE, RELATIONS_STORE],
    'readwrite',
  )
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  danglingRelationIds.forEach((relationId) => relationStore.delete(relationId))
  const createdAt = new Date()
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
  relationStore.add(relation)
  await awaitTransaction(transaction)
  if (danglingRelationIds.length) {
    recordDeletion(db, 'relationCount', danglingRelationIds.length)
  }
  recordCreation(db, 'sentenceCount')
  recordCreation(db, 'relationCount')
}
