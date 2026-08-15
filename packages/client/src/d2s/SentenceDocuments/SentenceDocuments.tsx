import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PagedSection } from '../../shared/PagedSection'
import { D2S_RELATIONS_QUERY_KEY } from '../consts'
import { getDocumentToSentenceRelationsBySentence } from '../d2s.service'
import { D2sTable } from '../D2sTable'
import { hydrateD2sEntries } from '../hydrateD2sEntries'

interface SentenceDocumentsProps {
  sentenceId: number
}

export function SentenceDocuments({ sentenceId }: SentenceDocumentsProps): ReactElement {
  const { data, isPending, error } = useQuery({
    queryKey: [D2S_RELATIONS_QUERY_KEY, 'sentence', sentenceId],
    queryFn: async () =>
      hydrateD2sEntries(await getDocumentToSentenceRelationsBySentence(sentenceId)),
    retry: false,
  })

  return (
    <PagedSection
      title="연결된 문서"
      state={{ entries: data ?? [], isPending, error }}
      isLoaderVisible={false}
      renderTable={(pageEntries) => <D2sTable entries={pageEntries} hiddenColumn="sentence" />}
    />
  )
}
