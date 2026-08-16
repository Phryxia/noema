import type { ReactElement, ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { deleteRelation } from '../deleteRelation'
import type { RelationBase } from '../types'
import { invalidateRelationQueries } from '../utils'
import { MetaFields } from '../../meta/MetaFields/MetaFields'

export interface PairRelationRow {
  label: string
  content: ReactNode
}

interface PairRelationPageProps {
  relation: RelationBase
  rows: PairRelationRow[]
}

export function PairRelationPage({ relation, rows }: PairRelationPageProps): ReactElement {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteRelation(relation.relationId),
    meta: { successMessage: '관계를 삭제했습니다' },
    onSuccess: () => {
      invalidateRelationQueries(queryClient)
      navigate({ to: '/relations', search: true })
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
      {rows.map((row) => (
        <p key={row.label}>
          {row.label}: {row.content}
        </p>
      ))}
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
