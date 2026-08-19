import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { Option } from '../types'
import styles from './TypeFilterField.module.css'

const cx = classnames.bind(styles)

interface TypeFilterFieldProps<T extends string> {
  label: string
  options: Option<T>[]
  value: T[]
  onChange: (value: T[]) => void
}

export function TypeFilterField<T extends string>({
  label,
  options,
  value,
  onChange,
}: TypeFilterFieldProps<T>): ReactElement {
  const selected = new Set(value)
  const remaining = options.filter((option) => !selected.has(option.value))

  function findOption(raw: string): Option<T> | undefined {
    return options.find((option) => option.value === raw)
  }

  function replace(index: number, raw: string): void {
    const option = findOption(raw)
    if (!option) {
      return
    }
    onChange(value.map((type, i) => (i === index ? option.value : type)))
  }

  function add(raw: string): void {
    const option = findOption(raw)
    if (!option) {
      return
    }
    onChange([...value, option.value])
  }

  function remove(index: number): void {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cx('root')}>
      <span key="label">{label}</span>
      {value.map((type, index) => (
        <TypeBadge
          key={index}
          option={findOption(type)}
          remaining={remaining}
          onChange={(raw) => replace(index, raw)}
          onRemove={() => remove(index)}
        />
      ))}
      {!!remaining.length && (
        <select
          value=""
          aria-label={`${label} 추가`}
          onChange={(event) => add(event.target.value)}
        >
          <option value="">유형 추가</option>
          <TypeOptions options={remaining} />
        </select>
      )}
    </div>
  )
}

interface TypeBadgeProps<T extends string> {
  option: Option<T> | undefined
  remaining: Option<T>[]
  onChange: (raw: string) => void
  onRemove: () => void
}

function TypeBadge<T extends string>({
  option,
  remaining,
  onChange,
  onRemove,
}: TypeBadgeProps<T>): ReactElement | null {
  if (!option) {
    return null
  }
  return (
    <fieldset role="group" className={cx('badge')}>
      <select value={option.value} onChange={(event) => onChange(event.target.value)}>
        <TypeOptions options={[option, ...remaining]} />
      </select>
      <button
        type="button"
        className="secondary"
        aria-label={`${option.label} 제외`}
        onClick={onRemove}
      >
        x
      </button>
    </fieldset>
  )
}

function TypeOptions<T extends string>({ options }: { options: Option<T>[] }): ReactElement {
  return (
    <>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  )
}
