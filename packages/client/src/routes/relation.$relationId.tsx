import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { D2sRelationPage } from '../d2s/D2sRelationPage/D2sRelationPage'
import { RELATION_QUERY_KEY } from '../relation/consts'
import { deleteRelation } from '../relation/deleteRelation'
import { loadRelationSnapshot } from '../relation/loadRelationSnapshot'
import type { WordRelationSnapshot } from '../relation/loadRelationSnapshot'
import { RelationPage } from '../relation/RelationPage/RelationPage'
import { updateRelation } from '../relation/updateRelation'
import { useRelationEditor } from '../relation/useRelationEditor'

export const Route = createFileRoute('/relation/$relationId')({
  component: RelationDetailPage,
})

function RelationDetailPage(): ReactElement {
  const { relationId } = Route.useParams()
  const { data: snapshot, isPending } = useQuery({
    queryKey: [RELATION_QUERY_KEY, relationId],
    queryFn: () => loadRelationSnapshot(Number(relationId)),
  })

  if (isPending) {
    return <article aria-busy="true" />
  }
  if (!snapshot) {
    return <article>존재하지 않는 관계: {relationId}</article>
  }
  if (snapshot.kind === 'd2s') {
    return <D2sRelationPage key={relationId} snapshot={snapshot} />
  }
  return <RelationEditor key={relationId} snapshot={snapshot} />
}

interface RelationEditorProps {
  snapshot: WordRelationSnapshot
}

function RelationEditor({ snapshot }: RelationEditorProps): ReactElement {
  const { relation, words, answer, comment } = snapshot
  const navigate = useNavigate()

  const editor = useRelationEditor({
    getInitial: () => ({ type: relation.type, words, answer, comment }),
    isTypeEditable: false,
    isResetOnSave: false,
    persist: (values) => updateRelation({ relation, ...values }),
    remove: () => deleteRelation(relation.relationId),
    onRemoved: () => navigate({ to: '/relations/w2w', search: true }),
  })

  return (
    <RelationPage
      title="관계"
      editor={editor}
      meta={[
        { label: 'relationId', value: relation.relationId },
        { label: 'questionId', value: relation.questionId },
        { label: 'createdAt', value: relation.createdAt },
        { label: 'modifiedAt', value: relation.modifiedAt },
      ]}
    />
  )
}
