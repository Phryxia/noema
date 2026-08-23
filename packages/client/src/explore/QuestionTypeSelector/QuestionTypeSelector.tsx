import type { ReactElement } from 'react'
import { QuestionTypeOptions } from '../consts'
import type { WordRelationType } from '../../relation/types'
import classnames from 'classnames/bind'
import styles from './QuestionTypeSelector.module.css'

const cx = classnames.bind(styles)

interface QuestionTypeSelectorProps {
  availableTypes?: WordRelationType[]
  checkedTypes: WordRelationType[]
  onChange: (checkedTypes: WordRelationType[]) => void
}

export function QuestionTypeSelector({
  availableTypes,
  checkedTypes,
  onChange,
}: QuestionTypeSelectorProps): ReactElement {
  const specs = availableTypes
    ? QuestionTypeOptions.filter(({ value }) => availableTypes.includes(value))
    : QuestionTypeOptions

  function toggle(type: WordRelationType): void {
    if (checkedTypes.includes(type)) {
      onChange(checkedTypes.filter((checked) => checked !== type))
      return
    }
    onChange(checkedTypes.concat(type))
  }

  return (
    <fieldset className={cx('root')}>
      {specs.map(({ value, label }) => (
        <label key={value}>
          <input
            type="checkbox"
            checked={checkedTypes.includes(value)}
            onChange={() => toggle(value)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  )
}
