import {
  DOCUMENT_ID_INDEX,
  DOCUMENTS_STORE,
  RELATIONS_STORE,
  SENTENCES_STORE,
} from '../db/consts'
import { openNoemaDB } from '../db/openNoemaDB'
import { awaitRequest } from '../db/utils'
import type { Relation } from '../relation/types'
import type { Sentence } from '../sentence/types'
import { checkIsDocumentTitleRelation } from './checkIsDocumentTitleRelation'
import type { ResolvedTitle } from './types'

export async function resolveDocumentTitleMap(
  documentIds: number[],
): Promise<Map<number, ResolvedTitle>> {
  const db = await openNoemaDB()
  const transaction = db.transaction([DOCUMENTS_STORE, RELATIONS_STORE, SENTENCES_STORE])
  const titles = await Promise.all(documentIds.map((id) => resolveTitle(transaction, id)))
  return new Map(documentIds.map((id, index) => [id, titles[index]]))
}

async function resolveTitle(
  transaction: IDBTransaction,
  documentId: number,
): Promise<ResolvedTitle> {
  const documentStore = transaction.objectStore(DOCUMENTS_STORE)
  if (!(await awaitRequest<number>(documentStore.count(documentId)))) {
    return ''
  }
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  const sentenceStore = transaction.objectStore(SENTENCES_STORE)
  const relations = await awaitRequest<Relation[]>(
    relationStore.index(DOCUMENT_ID_INDEX).getAll(documentId),
  )
  for (const relation of relations.filter(checkIsDocumentTitleRelation)) {
    const sentence = await awaitRequest<Sentence | undefined>(
      sentenceStore.get(relation.sentenceId),
    )
    if (sentence) {
      return sentence.value
    }
  }
  return null
}
