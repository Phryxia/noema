import type { QueryClient } from '@tanstack/react-query'
import { S2W_RELATIONS_QUERY_KEY } from './consts'

export function invalidateS2wQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [S2W_RELATIONS_QUERY_KEY] })
}
