import type { QueryClient } from '@tanstack/react-query'
import {
  RECENT_WORDS_QUERY_KEY,
  WORD_NODE_ID_QUERY_KEY,
  WORD_SUGGESTION_QUERY_KEY,
} from './consts'

export function invalidateWordQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [WORD_SUGGESTION_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RECENT_WORDS_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [WORD_NODE_ID_QUERY_KEY] })
}
