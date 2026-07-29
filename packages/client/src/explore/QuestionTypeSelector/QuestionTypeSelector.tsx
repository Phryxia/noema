import type { ReactElement } from 'react'
import { QuestionTypeSpecs } from '../consts'
import type { QuestionType } from '../../question/types'
import classnames from 'classnames/bind'
import styles from './QuestionTypeSelector.module.css'

const cx = classnames.bind(styles)

interface QuestionTypeSelectorProps {
  checkedTypes: QuestionType[]
  onChange: (checkedTypes: QuestionType[]) => void
}

export function QuestionTypeSelector({
  checkedTypes,
  onChange,
}: QuestionTypeSelectorProps): ReactElement {
  function toggle(type: QuestionType): void {
    if (checkedTypes.includes(type)) {
      onChange(checkedTypes.filter((checked) => checked !== type))
      return
    }
    onChange(checkedTypes.concat(type))
  }

  return (
    <fieldset className={cx('root')}>
      {QuestionTypeSpecs.map(({ type, label }) => (
        <label key={type}>
          <input
            type="checkbox"
            checked={checkedTypes.includes(type)}
            onChange={() => toggle(type)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  )
}
