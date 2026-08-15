import { useQuery } from '@tanstack/react-query'
import { QNA_SEARCH_QUERY_KEY } from './consts'
import { searchExactQnaEntries, searchPartialQnaEntries } from './qnaSearch.service'
import { PAGE_CACHE_MS } from '../../recent/consts'
import type { PagedState } from '../../shared/PagedSection'
import type { QnaEntry } from '../types'

interface QnaSearch {
  exact: PagedState<QnaEntry>
  partial: PagedState<QnaEntry>
}

export function useQnaSearch(query: string): QnaSearch {
  return {
    exact: useQnaSearchSection('exact', query, searchExactQnaEntries),
    partial: useQnaSearchSection('partial', query, searchPartialQnaEntries),
  }
}

function useQnaSearchSection(
  kind: 'exact' | 'partial',
  query: string,
  search: (query: string) => Promise<QnaEntry[]>,
): PagedState<QnaEntry> {
  const { data, isPending, error } = useQuery({
    queryKey: [QNA_SEARCH_QUERY_KEY, kind, query],
    queryFn: () => search(query),
    staleTime: PAGE_CACHE_MS,
    gcTime: PAGE_CACHE_MS,
    retry: false,
  })
  return { entries: data ?? [], isPending, error }
}
