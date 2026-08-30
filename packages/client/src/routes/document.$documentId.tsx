import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DOCUMENT_QUERY_KEY } from '../document/consts'
import { getDocument } from '../document/document.service'
import { getDocumentTitle } from '../document/documentTitle.service'
import { DocumentSentences } from '../document/DocumentSentences/DocumentSentences'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'
import { MetaFields } from '../meta/MetaFields/MetaFields'
import { TAG_RELATIONS_QUERY_KEY } from '../tag/consts'
import { getTagEntries } from '../tag/tag.service'

export const Route = createFileRoute('/document/$documentId')({
  component: DocumentPage,
})

function DocumentPage(): ReactElement {
  const { documentId } = Route.useParams()
  const navigate = useNavigate()
  const { data: target, isPending } = useQuery({
    queryKey: [DOCUMENT_QUERY_KEY, documentId],
    queryFn: () => getDocument(Number(documentId)),
  })
  const { data: title, isPending: isTitlePending } = useQuery({
    queryKey: [DOCUMENT_QUERY_KEY, documentId, 'title'],
    queryFn: () => getDocumentTitle(Number(documentId)),
    gcTime: 0,
  })
  const { data: tags, isPending: isTagsPending } = useQuery({
    queryKey: [TAG_RELATIONS_QUERY_KEY, 'document', documentId],
    queryFn: () => getTagEntries({ type: 'document', id: Number(documentId) }),
  })

  if (isPending || isTitlePending || isTagsPending) {
    return <article aria-busy="true" />
  }
  if (!target) {
    return <article>존재하지 않는 문서: {documentId}</article>
  }
  return (
    <article>
      <h2>문서</h2>
      <MetaFields
        fields={[
          { label: 'documentId', value: target.documentId },
          { label: 'createdAt', value: target.createdAt },
          { label: 'modifiedAt', value: target.modifiedAt },
        ]}
      />
      <DocumentWriter
        key={target.documentId}
        isEditable
        document={target}
        title={title ?? undefined}
        tags={tags}
        onDelete={() => navigate({ to: '/' })}
      />
      <DocumentSentences key={target.documentId} document={target} />
    </article>
  )
}
