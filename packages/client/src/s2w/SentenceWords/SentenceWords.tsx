import type { ReactElement } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { S2W_RELATIONS_QUERY_KEY } from '../consts'
import { hydrateS2wEntries } from '../hydrateS2wEntries'
import { getSentenceToWordRelationsBySentence } from '../s2w.service'
import { S2wTable } from '../S2wTable'
import { useSentenceWordDeletion } from './useSentenceWordDeletion'
import { WordExtractor } from '../../extraction/WordExtractor/WordExtractor'
import { PagedSection } from '../../shared/PagedSection'
import type { Sentence } from '../../sentence/types'

interface SentenceWordsProps {
  sentence: Sentence
}

export function SentenceWords({ sentence }: SentenceWordsProps): ReactElement {
  const [isExtracting, setIsExtracting] = useState(false)
  const { data, isPending, error } = useQuery({
    queryKey: [S2W_RELATIONS_QUERY_KEY, 'sentence', sentence.sentenceId],
    queryFn: async () =>
      hydrateS2wEntries(await getSentenceToWordRelationsBySentence(sentence.sentenceId)),
    retry: false,
  })
  const entries = data ?? []
  const deleteEntry = useSentenceWordDeletion()

  if (isExtracting) {
    return (
      <section>
        <h3>단어 추출</h3>
        <WordExtractor sentence={sentence} onClose={() => setIsExtracting(false)} />
      </section>
    )
  }
  if (isPending || error || entries.length) {
    return (
      <PagedSection
        title="연관 단어"
        state={{ entries, isPending, error }}
        isLoaderVisible
        renderTable={(pageEntries) => (
          <S2wTable entries={pageEntries} hiddenColumn="sentence" onDelete={deleteEntry} />
        )}
      />
    )
  }
  return (
    <section>
      <h3>연관 단어</h3>
      <button type="button" onClick={() => setIsExtracting(true)}>
        단어 추출
      </button>
    </section>
  )
}
