import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DOCUMENT_QUERY_KEY } from '../document/consts'
import { getDocument } from '../document/document.service'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'

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

  if (isPending) {
    return <article aria-busy="true" />
  }
  if (!target) {
    return <article>존재하지 않는 문서: {documentId}</article>
  }
  return (
    <article>
      <h2>문서</h2>
      <p>id: {target.documentId}</p>
      <DocumentWriter
        key={target.documentId}
        isEditable
        document={target}
        onDelete={() => navigate({ to: '/' })}
      />
    </article>
  )
}
