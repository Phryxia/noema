import type { QueryClient } from '@tanstack/react-query'
import { RECENT_SENTENCES_QUERY_KEY, SENTENCE_QUERY_KEY } from './consts'
import { invalidateStatisticQueries } from '../statistic/utils'

export function invalidateSentenceQueries(queryClient: QueryClient): void {
  invalidateStatisticQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [SENTENCE_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RECENT_SENTENCES_QUERY_KEY] })
}
