import type { ReactElement } from 'react'
import { useState } from 'react'
import classnames from 'classnames/bind'
import styles from './UsageWordCountControl.module.css'

const cx = classnames.bind(styles)

interface UsageWordCountControlProps {
  value: number
  onChange: (count: number) => void
}

export function UsageWordCountControl({
  value,
  onChange,
}: UsageWordCountControlProps): ReactElement {
  const [count, setCount] = useState(String(value))

  function updateCount(nextValue: string): void {
    setCount(nextValue)
    const parsed = Number(nextValue)
    if (!Number.isInteger(parsed) || parsed < 1) {
      return
    }
    onChange(parsed)
  }

  return (
    <label className={cx('root')}>
      <span>예문 단어 수</span>
      <input
        type="number"
        min={1}
        step={1}
        value={count}
        onChange={(event) => updateCount(event.target.value)}
      />
    </label>
  )
}
