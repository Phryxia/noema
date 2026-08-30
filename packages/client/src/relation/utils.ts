import type { QueryClient } from '@tanstack/react-query'
import { invalidateD2sQueries } from '../d2s/utils'
import { invalidateDocumentQueries } from '../document/utils'
import { QNA_SEARCH_QUERY_KEY } from '../qna/search/consts'
import { RELATION_PAGES_QUERY_KEY } from '../relations/consts'
import { invalidateS2wQueries } from '../s2w/utils'
import { invalidateSentenceQueries } from '../sentence/utils'
import { invalidateTagQueries } from '../tag/utils'
import { WORD_RELATIONS_QUERY_KEY } from '../word/consts'
import { invalidateWordQueries } from '../word/utils'
import { RELATION_QUERY_KEY } from './consts'

export function invalidateRelationQueries(queryClient: QueryClient): void {
  invalidateWordQueries(queryClient)
  invalidateSentenceQueries(queryClient)
  invalidateDocumentQueries(queryClient)
  queryClient.invalidateQueries({ queryKey: [RELATION_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [RELATION_PAGES_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [QNA_SEARCH_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [WORD_RELATIONS_QUERY_KEY] })
  invalidateD2sQueries(queryClient)
  invalidateS2wQueries(queryClient)
  invalidateTagQueries(queryClient)
}
