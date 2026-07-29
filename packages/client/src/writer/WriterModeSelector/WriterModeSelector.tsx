import type { ReactElement } from 'react'

interface WriterModeSelectorProps<TMode extends string> {
  name: string
  modes: TMode[]
  mode: TMode
  onChange: (mode: TMode) => void
}

export function WriterModeSelector<TMode extends string>({
  name,
  modes,
  mode,
  onChange,
}: WriterModeSelectorProps<TMode>): ReactElement {
  return (
    <fieldset role="group">
      {modes.map((candidate) => (
        <label key={candidate}>
          <input
            type="radio"
            name={name}
            checked={mode === candidate}
            onChange={() => onChange(candidate)}
          />
          {candidate}
        </label>
      ))}
    </fieldset>
  )
}
