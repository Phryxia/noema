import { useQuery } from '@tanstack/react-query'
import { hydrateRelationEntries } from './hydrateRelationEntries'
import type { RelationEntry } from './types'
import { QNA_SEARCH_QUERY_KEY } from '../qna/search/consts'
import { searchExactRelations, searchPartialRelations } from '../qna/search/qnaSearch.service'
import { PAGE_CACHE_MS } from '../recent/consts'
import type { WordRelation } from '../relation/types'
import type { PagedState } from '../shared/PagedSection'

interface RelationSearch {
  exact: PagedState<RelationEntry>
  partial: PagedState<RelationEntry>
}

export function useRelationSearch(query: string): RelationSearch {
  return {
    exact: useRelationSearchSection('exact', query, searchExactRelations),
    partial: useRelationSearchSection('partial', query, searchPartialRelations),
  }
}

function useRelationSearchSection(
  kind: 'exact' | 'partial',
  query: string,
  search: (query: string) => Promise<WordRelation[]>,
): PagedState<RelationEntry> {
  const { data, isPending, error } = useQuery({
    queryKey: [QNA_SEARCH_QUERY_KEY, kind, query],
    queryFn: async () => hydrateRelationEntries(await search(query)),
    staleTime: PAGE_CACHE_MS,
    gcTime: PAGE_CACHE_MS,
    retry: false,
  })
  return { entries: data ?? [], isPending, error }
}
