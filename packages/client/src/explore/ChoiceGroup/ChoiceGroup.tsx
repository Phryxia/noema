import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import styles from './ChoiceGroup.module.css'

const cx = classnames.bind(styles)

export interface Choice<TValue> {
  label: string
  value: TValue
}

interface ChoiceGroupProps<TValue> {
  choices: Choice<TValue>[]
  selected: TValue | null
  onSelect: (value: TValue) => void
}

export function ChoiceGroup<TValue>({
  choices,
  selected,
  onSelect,
}: ChoiceGroupProps<TValue>): ReactElement {
  return (
    <div className={cx('center')}>
      <div role="group" className={cx('root')}>
        {choices.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            className={cx({ secondary: value !== selected })}
            aria-pressed={value === selected}
            onClick={() => onSelect(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
