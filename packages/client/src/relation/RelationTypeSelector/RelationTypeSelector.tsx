import type { ReactElement } from 'react'
import { QuestionTypeSpecs } from '../../explore/consts'
import type { QuestionType } from '../../question/types'
import classnames from 'classnames/bind'
import styles from './RelationTypeSelector.module.css'

const cx = classnames.bind(styles)

interface RelationTypeSelectorProps {
  type: QuestionType
  onChange: (type: QuestionType) => void
}

export function RelationTypeSelector({
  type,
  onChange,
}: RelationTypeSelectorProps): ReactElement {
  return (
    <fieldset className={cx('root')}>
      {QuestionTypeSpecs.map((spec) => (
        <label key={spec.type}>
          <input
            type="radio"
            name="relationType"
            checked={type === spec.type}
            onChange={() => onChange(spec.type)}
          />
          {spec.label}
        </label>
      ))}
    </fieldset>
  )
}
