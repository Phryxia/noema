import type { ReactElement } from 'react'
import { useRef } from 'react'
import { useChoiceShortcut } from './useChoiceShortcut'
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
  hasKeyboardShortcut?: boolean
  onSelect: (value: TValue) => void
}

export function ChoiceGroup<TValue>({
  choices,
  selected,
  hasKeyboardShortcut,
  onSelect,
}: ChoiceGroupProps<TValue>): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)

  useChoiceShortcut({
    isEnabled: !!hasKeyboardShortcut,
    rootRef,
    choices,
    hasSelection: selected !== null,
    onSelect,
  })

  return (
    <div className={cx('center')}>
      <div role="group" className={cx('root')} ref={rootRef}>
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
