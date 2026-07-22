import type { QueryClient } from '@tanstack/react-query'
import { DOCUMENT_QUERY_KEY, RECENT_DOCUMENTS_QUERY_KEY } from './consts'
import { invalidateStatisticQueries } from '../statistic/utils'

export function invalidateDocumentQueries(queryClient: QueryClient): void {
  invalidateStatisticQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [DOCUMENT_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RECENT_DOCUMENTS_QUERY_KEY] })
}
