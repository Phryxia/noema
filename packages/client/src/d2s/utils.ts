import type { QueryClient } from '@tanstack/react-query'
import { D2S_RELATIONS_QUERY_KEY } from './consts'

export function invalidateD2sQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [D2S_RELATIONS_QUERY_KEY] })
}
