import {
  QUESTIONS_STORE,
  RECENT_WORDS_STORE,
  RELATIONS_STORE,
  WORD_META_STORE,
  WORD_NODES_STORE,
} from '../db/consts'

export const ROOT_NODE_ID = 0

export const WordRewriteStoreNames = [
  WORD_META_STORE,
  WORD_NODES_STORE,
  RECENT_WORDS_STORE,
  RELATIONS_STORE,
  QUESTIONS_STORE,
]

export const WORD_SUGGESTION_QUERY_KEY = 'wordSuggestion'
export const RECENT_WORDS_QUERY_KEY = 'recentWords'
export const WORD_NODE_ID_QUERY_KEY = 'wordNodeId'
export const WORD_NODE_QUERY_KEY = 'wordNode'
export const WORD_RELATIONS_QUERY_KEY = 'wordRelations'
export const WORD_RELATIONS_CACHE_MS = 10 * 60 * 1000
