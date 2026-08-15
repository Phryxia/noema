import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QnaSearchSection } from '../../qna/search/QnaSearchSection'
import { searchExactQnaEntries } from '../../qna/search/qnaSearch.service'
import { WORD_RELATIONS_CACHE_MS, WORD_RELATIONS_QUERY_KEY } from '../consts'

interface WordRelationsProps {
  word: string
}

export function WordRelations({ word }: WordRelationsProps): ReactElement {
  const { data, isPending, error } = useQuery({
    queryKey: [WORD_RELATIONS_QUERY_KEY, word],
    queryFn: () => searchExactQnaEntries(word),
    staleTime: WORD_RELATIONS_CACHE_MS,
    gcTime: WORD_RELATIONS_CACHE_MS,
    retry: false,
  })

  return (
    <QnaSearchSection
      title="연관 관계"
      state={{ entries: data ?? [], isPending, error }}
      keyword={word}
      isLoaderVisible
      emptyMessage="연관된 관계가 없습니다."
    />
  )
}
