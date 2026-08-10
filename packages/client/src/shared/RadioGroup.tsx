import type { ChangeEvent, HTMLAttributes, ReactElement } from 'react'
import type { Option } from './types'

export interface RadioProps<T extends string> {
  /** `name` property for `<input>` elements. */
  name: string
  value: T
  options: Option<T>[] | T[]
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
        <label key={getLabel(option)}>
          <input
            type="radio"
            name={name}
            checked={value === getValue(option)}
            disabled={disabled}
            onChange={(event) => onChange(getValue(option), event)}
          />
          {getLabel(option)}
        </label>
      ))}
    </fieldset>
  )
}

function getLabel<T extends string>(option: Option<T> | T): string {
  return typeof option === 'string' ? option : option.label
}

function getValue<T extends string>(option: Option<T> | T): T {
  return typeof option === 'string' ? option : option.value
}
