import type { QueryClient } from '@tanstack/react-query'
import { DOCUMENT_QUERY_KEY, RECENT_DOCUMENTS_QUERY_KEY } from './consts'

export function invalidateDocumentQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [DOCUMENT_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RECENT_DOCUMENTS_QUERY_KEY] })
}
