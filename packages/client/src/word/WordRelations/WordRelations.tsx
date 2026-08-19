import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QuestionTypeOptions } from '../../explore/consts'
import { QnaTable } from '../../qna/QnaTable'
import { searchExactQnaEntries } from '../../qna/search/qnaSearch.service'
import type { QnaEntry } from '../../qna/types'
import type { QuestionType } from '../../question/types'
import { PagedSection } from '../../shared/PagedSection'
import { TypeFilterField } from '../../shared/TypeFilterField/TypeFilterField'
import { WORD_RELATIONS_CACHE_MS, WORD_RELATIONS_QUERY_KEY } from '../consts'

interface WordRelationsProps {
  word: string
}

export function WordRelations({ word }: WordRelationsProps): ReactElement {
  const [types, setTypes] = useState<QuestionType[]>([])
  const { data, isPending, error } = useQuery({
    queryKey: [WORD_RELATIONS_QUERY_KEY, word],
    queryFn: () => searchExactQnaEntries(word),
    staleTime: WORD_RELATIONS_CACHE_MS,
    gcTime: WORD_RELATIONS_CACHE_MS,
    retry: false,
  })
  const typesKey = types.join(',')
  const entries = useMemo(() => filterByTypes(data ?? [], types), [data, typesKey])

  return (
    <PagedSection
      title="연관 관계"
      state={{ entries, isPending, error }}
      isLoaderVisible
      emptyMessage="연관된 관계가 없습니다."
      header={
        <TypeFilterField
          label="포함 유형"
          options={QuestionTypeOptions}
          value={types}
          onChange={setTypes}
        />
      }
      resetKey={typesKey}
      renderTable={(pageEntries) => <QnaTable entries={pageEntries} keyword={word} />}
    />
  )
}

function filterByTypes(entries: QnaEntry[], types: QuestionType[]): QnaEntry[] {
  if (!types.length) {
    return entries
  }
  const allowed = new Set(types)
  return entries.filter((entry) => allowed.has(entry.type))
}
