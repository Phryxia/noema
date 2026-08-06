import type { ReactElement } from 'react'
import { RelationForm } from '../RelationForm/RelationForm'
import { RelationTypeSelector } from '../RelationTypeSelector/RelationTypeSelector'
import type { RelationEditor } from '../useRelationEditor'
import { MetaFields } from '../../meta/MetaFields/MetaFields'
import type { MetaField } from '../../meta/MetaFields/MetaFields'

interface RelationPageProps {
  title: string
  editor: RelationEditor
  meta?: MetaField[]
}

export function RelationPage({ title, editor, meta }: RelationPageProps): ReactElement {
  return (
    <article>
      <h2>{title}</h2>
      {meta && <MetaFields fields={meta} />}
      <RelationTypeSelector
        type={editor.type}
        isEditable={editor.isTypeEditable}
        onChange={editor.setType}
      />
      <hr />
      <RelationForm editor={editor} />
    </article>
  )
}
