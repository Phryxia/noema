import type { ReactElement } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { D2S_RELATIONS_QUERY_KEY } from '../../d2s/consts'
import { getDocumentToSentenceRelationsByDocument } from '../../d2s/d2s.service'
import { D2sTable } from '../../d2s/D2sTable'
import { hydrateD2sEntries } from '../../d2s/hydrateD2sEntries'
import { SentenceExtractor } from '../../extraction/SentenceExtractor/SentenceExtractor'
import { PagedSection } from '../../shared/PagedSection'
import type { Document } from '../types'

interface DocumentSentencesProps {
  document: Document
}

export function DocumentSentences({ document }: DocumentSentencesProps): ReactElement {
  const [isExtracting, setIsExtracting] = useState(false)
  const { data, isPending, error } = useQuery({
    queryKey: [D2S_RELATIONS_QUERY_KEY, 'document', document.documentId],
    queryFn: async () =>
      hydrateD2sEntries(await getDocumentToSentenceRelationsByDocument(document.documentId)),
    retry: false,
  })
  const entries = data ?? []

  if (isPending || error || entries.length) {
    return (
      <PagedSection
        title="연결된 문장"
        state={{ entries, isPending, error }}
        isLoaderVisible
        renderTable={(pageEntries) => (
          <D2sTable entries={pageEntries} hiddenColumn="document" />
        )}
      />
    )
  }
  return (
    <section>
      <h3>{isExtracting ? '문장 추출' : '연결된 문장'}</h3>
      {isExtracting ? (
        <SentenceExtractor document={document} />
      ) : (
        <button type="button" onClick={() => setIsExtracting(true)}>
          문장 추출
        </button>
      )}
    </section>
  )
}
