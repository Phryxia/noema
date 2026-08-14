import type { QueryClient } from '@tanstack/react-query'
import {
  RECENT_WORDS_QUERY_KEY,
  WORD_NODE_ID_QUERY_KEY,
  WORD_NODE_QUERY_KEY,
  WORD_SUGGESTION_QUERY_KEY,
} from './consts'
import { invalidateStatisticQueries } from '../statistic/utils'
import { QNA_PAGES_QUERY_KEY } from '../qna/QnaRelationSource'
import { QNA_SEARCH_QUERY_KEY } from '../qna/search/consts'

export function invalidateWordQueries(queryClient: QueryClient): void {
  invalidateStatisticQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [WORD_SUGGESTION_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RECENT_WORDS_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [WORD_NODE_ID_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [WORD_NODE_QUERY_KEY] })
}

export function invalidateWordAndQnaQueries(queryClient: QueryClient): void {
  invalidateWordQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [QNA_PAGES_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [QNA_SEARCH_QUERY_KEY] })
}
