import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { S2W_RELATIONS_QUERY_KEY } from '../consts'
import { hydrateS2wEntries } from '../hydrateS2wEntries'
import { getSentenceToWordRelationsByWord } from '../s2w.service'
import { S2wTable } from '../S2wTable'
import { PagedSection } from '../../shared/PagedSection'

interface WordSentencesProps {
  wordId: number
}

export function WordSentences({ wordId }: WordSentencesProps): ReactElement {
  const { data, isPending, error } = useQuery({
    queryKey: [S2W_RELATIONS_QUERY_KEY, 'word', wordId],
    queryFn: async () => hydrateS2wEntries(await getSentenceToWordRelationsByWord(wordId)),
    retry: false,
  })

  return (
    <PagedSection
      title="단어를 추출한 문장"
      state={{ entries: data ?? [], isPending, error }}
      isLoaderVisible={false}
      renderTable={(pageEntries) => <S2wTable entries={pageEntries} hiddenColumn="word" />}
    />
  )
}
