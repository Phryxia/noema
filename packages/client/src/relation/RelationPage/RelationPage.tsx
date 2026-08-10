import classnames from 'classnames/bind'
import styles from './RelationPage.module.css'
import type { ReactElement } from 'react'
import { RadioGroup } from '../../shared/RadioGroup'
import { RelationForm } from '../RelationForm/RelationForm'
import type { RelationEditor } from '../useRelationEditor'
import { MetaFields } from '../../meta/MetaFields/MetaFields'
import type { MetaField } from '../../meta/MetaFields/MetaFields'
import type { QuestionType } from '../../question/types'
import { QuestionTypeSpecs } from '../../explore/consts'

const cx = classnames.bind(styles)

interface RelationPageProps {
  title: string
  editor: RelationEditor
  meta?: MetaField[]
  hasRandomPick?: boolean
}

const QuestionOptions = QuestionTypeSpecs.map((spec) => ({
  value: spec.type,
  label: spec.label,
}))

export function RelationPage({
  title,
  editor,
  meta,
  hasRandomPick,
}: RelationPageProps): ReactElement {
  return (
    <article>
      <h2>{title}</h2>
      {meta && <MetaFields fields={meta} />}
      <RadioGroup<QuestionType>
        className={cx('radio-group')}
        name="relationType"
        value={editor.type}
        options={QuestionOptions}
        onChange={editor.setType}
        disabled={!editor.isTypeEditable}
      />
      <hr />
      <RelationForm editor={editor} hasRandomPick={hasRandomPick} />
    </article>
  )
}
