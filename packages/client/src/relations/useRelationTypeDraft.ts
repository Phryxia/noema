import { useEffect, useState } from 'react'
import type { Relation } from '../relation/types'

interface RelationTypeDraft {
  draft: Relation['type'][]
  setDraft: (types: Relation['type'][]) => void
  isChanged: boolean
}

export function useRelationTypeDraft(
  appliedTypes: Relation['type'][],
  appliedKey: string,
): RelationTypeDraft {
  const [draft, setDraft] = useState(appliedTypes)

  useEffect(() => {
    setDraft(appliedTypes)
  }, [appliedKey])

  return { draft, setDraft, isChanged: draft.join(',') !== appliedKey }
}
