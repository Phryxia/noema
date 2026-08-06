import type { ReactElement } from 'react'
import { RelationForm } from '../RelationForm/RelationForm'
import { RelationTypeSelector } from '../RelationTypeSelector/RelationTypeSelector'
import { useRelationEditor } from '../useRelationEditor'

export function RelationPage(): ReactElement {
  const editor = useRelationEditor()

  return (
    <article>
      <h2>알려주기</h2>
      <RelationTypeSelector type={editor.type} onChange={editor.setType} />
      <hr />
      <RelationForm editor={editor} />
    </article>
  )
}
