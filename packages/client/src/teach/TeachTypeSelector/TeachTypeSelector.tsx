import type { ReactElement } from 'react'
import { QuestionTypeSpecs } from '../../explore/consts'
import type { QuestionType } from '../../question/types'
import classnames from 'classnames/bind'
import styles from './TeachTypeSelector.module.css'

const cx = classnames.bind(styles)

interface TeachTypeSelectorProps {
  type: QuestionType
  onChange: (type: QuestionType) => void
}

export function TeachTypeSelector({ type, onChange }: TeachTypeSelectorProps): ReactElement {
  return (
    <fieldset className={cx('root')}>
      {QuestionTypeSpecs.map((spec) => (
        <label key={spec.type}>
          <input
            type="radio"
            name="teachType"
            checked={type === spec.type}
            onChange={() => onChange(spec.type)}
          />
          {spec.label}
        </label>
      ))}
    </fieldset>
  )
}
