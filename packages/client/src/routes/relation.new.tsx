import type { ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createEmptyRelationValues } from '../relation/createEmptyRelationValues'
import { RelationPage } from '../relation/RelationPage/RelationPage'
import { submitRelation } from '../relation/submitRelation'
import { useRelationEditor } from '../relation/useRelationEditor'

export const Route = createFileRoute('/relation/new')({
  component: NewRelationPage,
})

function NewRelationPage(): ReactElement {
  const editor = useRelationEditor({
    getInitial: createEmptyRelationValues,
    isTypeEditable: true,
    isResetOnSave: true,
    persist: submitRelation,
  })

  return <RelationPage title="알려주기" editor={editor} hasRandomPick />
}
