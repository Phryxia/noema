import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QnaTable } from '../../qna/QnaTable'
import { searchExactQnaEntries } from '../../qna/search/qnaSearch.service'
import { PagedSection } from '../../shared/PagedSection'
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
    <PagedSection
      title="연관 관계"
      state={{ entries: data ?? [], isPending, error }}
      isLoaderVisible
      emptyMessage="연관된 관계가 없습니다."
      renderTable={(pageEntries) => <QnaTable entries={pageEntries} keyword={word} />}
    />
  )
}
