import type { QueryClient } from '@tanstack/react-query'
import { invalidateD2sQueries } from '../d2s/utils'
import { QNA_PAGES_QUERY_KEY } from '../qna/QnaRelationSource'
import { QNA_SEARCH_QUERY_KEY } from '../qna/search/consts'
import { invalidateSentenceQueries } from '../sentence/utils'
import { WORD_RELATIONS_QUERY_KEY } from '../word/consts'
import { invalidateWordQueries } from '../word/utils'
import { RELATION_QUERY_KEY } from './consts'

export function invalidateRelationQueries(queryClient: QueryClient): void {
  invalidateWordQueries(queryClient)
  invalidateSentenceQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [RELATION_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [QNA_PAGES_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [QNA_SEARCH_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [WORD_RELATIONS_QUERY_KEY] })
  invalidateD2sQueries(queryClient)
}
