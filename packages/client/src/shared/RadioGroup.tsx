import type { ChangeEvent, HTMLAttributes, ReactElement } from 'react'
import type { Option } from './types'

export interface RadioProps<T extends string> {
  /** `name` property for `<input>` elements. */
  name: string
  value: T
  options: Option<T>[]
  /** `event` is raised one from react */
  onChange: (value: T, event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

/**
 * Controlled radio group component
 * To use default value, set the state of value as default one
 */
export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  disabled,
  ...rest
}: RadioProps<T> &
  Omit<
    HTMLAttributes<HTMLFieldSetElement>,
    'name' | 'defaultValue' | 'onChange'
  >): ReactElement {
  return (
    <fieldset {...rest}>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            disabled={disabled}
            onChange={(event) => onChange(option.value, event)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
