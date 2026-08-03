import type { ReactElement } from 'react'
import { useState } from 'react'
import classnames from 'classnames/bind'
import { DEFAULT_SOFTMAX_TEMPERATURE } from '../consts'
import styles from './TemperatureControl.module.css'

const cx = classnames.bind(styles)

interface TemperatureControlProps {
  onChange: (temperature: number) => void
}

export function TemperatureControl({ onChange }: TemperatureControlProps): ReactElement {
  const [temperature, setTemperature] = useState(String(DEFAULT_SOFTMAX_TEMPERATURE))

  function updateTemperature(value: string): void {
    setTemperature(value)
    const parsed = Number(value)
    if (!value || !Number.isFinite(parsed) || parsed < 0) {
      return
    }
    onChange(parsed)
  }

  return (
    <label className={cx('root')}>
      <span>출제 온도 τ</span>
      <input
        type="number"
        min={0}
        step={0.1}
        value={temperature}
        onChange={(event) => updateTemperature(event.target.value)}
      />
    </label>
  )
}
