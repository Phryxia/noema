import type { QueryClient } from '@tanstack/react-query'
import { TAG_RELATIONS_QUERY_KEY } from './consts'

export function invalidateTagQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [TAG_RELATIONS_QUERY_KEY] })
}
