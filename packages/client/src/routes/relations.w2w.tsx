import { createFileRoute } from '@tanstack/react-router'
import { QnaPage } from '../qna/QnaPage'

interface QnaSearchParams {
  q?: string
}

export const Route = createFileRoute('/relations/w2w')({
  component: QnaPage,
  validateSearch: (search: Record<string, unknown>): QnaSearchParams => {
    if (typeof search.q === 'string' && search.q) {
      return { q: search.q }
    }
    return {}
  },
})
