import {
  ANSWER_INDEX,
  COMMENT_INDEX,
  CREATED_AT_INDEX,
  DOCUMENT_ID_INDEX,
  DOCUMENTS_STORE,
  RELATIONS_STORE,
  SENTENCE_ID_INDEX,
  SENTENCES_STORE,
  WORD1_ID_INDEX,
  WORD2_ID_INDEX,
  WORD3_ID_INDEX,
  WORD_ID_INDEX,
  WORD_IDS_INDEX,
  WORD_NODES_STORE,
} from './consts'

export interface IndexSpec {
  storeName: string
  name: string
  keyPath: string | string[]
  options?: IDBIndexParameters
}

export const IndexSpecs: IndexSpec[] = [
  { storeName: SENTENCES_STORE, name: CREATED_AT_INDEX, keyPath: CREATED_AT_INDEX },
  { storeName: DOCUMENTS_STORE, name: CREATED_AT_INDEX, keyPath: CREATED_AT_INDEX },
  { storeName: WORD_NODES_STORE, name: CREATED_AT_INDEX, keyPath: CREATED_AT_INDEX },
  { storeName: RELATIONS_STORE, name: CREATED_AT_INDEX, keyPath: CREATED_AT_INDEX },
  { storeName: RELATIONS_STORE, name: WORD_ID_INDEX, keyPath: WORD_ID_INDEX },
  {
    storeName: RELATIONS_STORE,
    name: WORD_IDS_INDEX,
    keyPath: WORD_IDS_INDEX,
    options: { multiEntry: true },
  },
  { storeName: RELATIONS_STORE, name: WORD1_ID_INDEX, keyPath: WORD1_ID_INDEX },
  { storeName: RELATIONS_STORE, name: WORD2_ID_INDEX, keyPath: WORD2_ID_INDEX },
  { storeName: RELATIONS_STORE, name: WORD3_ID_INDEX, keyPath: WORD3_ID_INDEX },
  {
    storeName: RELATIONS_STORE,
    name: ANSWER_INDEX,
    keyPath: [`${ANSWER_INDEX}.type`, `${ANSWER_INDEX}.id`],
  },
  {
    storeName: RELATIONS_STORE,
    name: COMMENT_INDEX,
    keyPath: [`${COMMENT_INDEX}.type`, `${COMMENT_INDEX}.id`],
  },
  { storeName: RELATIONS_STORE, name: DOCUMENT_ID_INDEX, keyPath: DOCUMENT_ID_INDEX },
  { storeName: RELATIONS_STORE, name: SENTENCE_ID_INDEX, keyPath: SENTENCE_ID_INDEX },
]
