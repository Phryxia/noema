import { createFileRoute } from '@tanstack/react-router'
import { RelationsPage } from '../relations/RelationsPage'

interface RelationSearchParams {
  q?: string
}

export const Route = createFileRoute('/relations')({
  component: RelationsPage,
  validateSearch: (search: Record<string, unknown>): RelationSearchParams => {
    if (typeof search.q === 'string' && search.q) {
      return { q: search.q }
    }
    return {}
  },
})
