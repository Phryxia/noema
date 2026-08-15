import type { ReactElement } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { MetaFields } from '../../meta/MetaFields/MetaFields'
import { deleteRelation } from '../../relation/deleteRelation'
import type { DocumentToSentenceSnapshot } from '../../relation/loadRelationSnapshot'
import { invalidateRelationQueries } from '../../relation/utils'
import { DocumentCell, SentenceCell } from '../D2sCells'

interface D2sRelationPageProps {
  snapshot: DocumentToSentenceSnapshot
}

export function D2sRelationPage({ snapshot }: D2sRelationPageProps): ReactElement {
  const { relation, entry } = snapshot
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteRelation(relation.relationId),
    meta: { successMessage: '관계를 삭제했습니다' },
    onSuccess: () => {
      invalidateRelationQueries(queryClient)
      navigate({ to: '/relations/d2s' })
    },
  })

  return (
    <article>
      <h2>관계</h2>
      <MetaFields
        fields={[
          { label: 'relationId', value: relation.relationId },
          { label: 'createdAt', value: relation.createdAt },
          { label: 'modifiedAt', value: relation.modifiedAt },
        ]}
      />
      <p>
        문서: <DocumentCell document={entry.document} />
      </p>
      <p>
        문장: <SentenceCell sentence={entry.sentence} />
      </p>
      <button
        type="button"
        className="secondary"
        disabled={isDeleting}
        aria-busy={isDeleting}
        onClick={() => remove()}
      >
        {!isDeleting && '삭제'}
      </button>
    </article>
  )
}
