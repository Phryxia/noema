import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hydrateRelationEntries } from './hydrateRelationEntries'
import type { RelationEntry } from './types'
import { QNA_SEARCH_QUERY_KEY } from '../qna/search/consts'
import { searchExactRelations, searchPartialRelations } from '../qna/search/qnaSearch.service'
import { PAGE_CACHE_MS } from '../recent/consts'
import type { Relation, WordRelation } from '../relation/types'
import type { PagedState } from '../shared/PagedSection'

interface RelationSearch {
  exact: PagedState<RelationEntry>
  partial: PagedState<RelationEntry>
}

export function useRelationSearch(query: string, types: Relation['type'][]): RelationSearch {
  return {
    exact: useRelationSearchSection('exact', query, types, searchExactRelations),
    partial: useRelationSearchSection('partial', query, types, searchPartialRelations),
  }
}

function useRelationSearchSection(
  kind: 'exact' | 'partial',
  query: string,
  types: Relation['type'][],
  search: (query: string) => Promise<WordRelation[]>,
): PagedState<RelationEntry> {
  const { data, isPending, error } = useQuery({
    queryKey: [QNA_SEARCH_QUERY_KEY, kind, query],
    queryFn: async () => hydrateRelationEntries(await search(query)),
    staleTime: PAGE_CACHE_MS,
    gcTime: PAGE_CACHE_MS,
    retry: false,
  })
  const entries = useMemo(() => filterByTypes(data ?? [], types), [data, types.join(',')])
  return { entries, isPending, error }
}

function filterByTypes(entries: RelationEntry[], types: Relation['type'][]): RelationEntry[] {
  if (!types.length) {
    return entries
  }
  const allowed = new Set(types)
  return entries.filter((entry) => allowed.has(entry.type))
}
