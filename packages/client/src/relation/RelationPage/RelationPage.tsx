import classnames from 'classnames/bind'
import styles from './RelationPage.module.css'
import type { ReactElement } from 'react'
import { RadioGroup } from '../../shared/RadioGroup'
import { RelationForm } from '../RelationForm/RelationForm'
import type { RelationEditor } from '../useRelationEditor'
import { BatchResultTable } from '../batch/BatchResultTable'
import type { BatchRelationEditor } from '../batch/useBatchRelationEditor'
import { MetaFields } from '../../meta/MetaFields/MetaFields'
import type { MetaField } from '../../meta/MetaFields/MetaFields'
import type { WordRelationType } from '../types'
import { QuestionTypeOptions } from '../../explore/consts'

const cx = classnames.bind(styles)

interface RelationPageProps {
  title: string
  editor: RelationEditor
  batch?: BatchRelationEditor
  meta?: MetaField[]
  hasRandomPick?: boolean
}

export function RelationPage({
  title,
  editor,
  batch,
  meta,
  hasRandomPick,
}: RelationPageProps): ReactElement {
  return (
    <article>
      <h2>{title}</h2>
      {meta && <MetaFields fields={meta} />}
      <RadioGroup<WordRelationType>
        className={cx('radio-group')}
        name="relationType"
        value={editor.type}
        options={QuestionTypeOptions}
        onChange={editor.setType}
        disabled={!editor.isTypeEditable}
      />
      <hr />
      {batch && editor.type === 'NamedAssociation' && (
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={batch.isEnabled}
            onChange={(event) => batch.setEnabled(event.target.checked)}
          />
          배치 모드
        </label>
      )}
      <RelationForm editor={editor} batch={batch} hasRandomPick={hasRandomPick} />
      {batch?.isActive && batch.results && (
        <section>
          <h3>삽입 결과</h3>
          <BatchResultTable entries={batch.results} />
        </section>
      )}
    </article>
  )
}
