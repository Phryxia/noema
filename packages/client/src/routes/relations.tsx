import { createFileRoute } from '@tanstack/react-router'
import { parseRangePageParams } from '../recent/parseRangePageParams'
import type { RangePageParams } from '../recent/parseRangePageParams'
import { RelationsPage } from '../relations/RelationsPage'

interface RelationSearchParams extends RangePageParams {
  q?: string
  types?: string
}

export const Route = createFileRoute('/relations')({
  component: RelationsPage,
  validateSearch: (search: Record<string, unknown>): RelationSearchParams => {
    const params: RelationSearchParams = parseRangePageParams(search)
    if (typeof search.q === 'string' && search.q) {
      params.q = search.q
    }
    if (typeof search.types === 'string' && search.types) {
      params.types = search.types
    }
    return params
  },
})
