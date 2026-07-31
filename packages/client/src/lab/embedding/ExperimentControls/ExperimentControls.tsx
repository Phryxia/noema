import type { ReactElement } from 'react'
import { useState } from 'react'
import { checkIsValidDimRange } from '../computeDims'
import type { DimRange } from '../computeDims'

interface ExperimentControlsProps {
  isLoaded: boolean
  isRunning: boolean
  progress: number
  onStart: (range: DimRange) => void
}

export function ExperimentControls({
  isLoaded,
  isRunning,
  progress,
  onStart,
}: ExperimentControlsProps): ReactElement {
  const [dMin, setDMin] = useState('2')
  const [dMax, setDMax] = useState('32')
  const [dResolution, setDResolution] = useState('4')
  const range: DimRange = {
    dMin: Number(dMin),
    dMax: Number(dMax),
    dResolution: Number(dResolution),
  }
  const isStartable = isLoaded && !isRunning && checkIsValidDimRange(range)

  return (
    <section>
      <div role="group">
        <input
          type="number"
          aria-label="dMin"
          placeholder="dMin"
          value={dMin}
          onChange={(event) => setDMin(event.target.value)}
        />
        <input
          type="number"
          aria-label="dMax"
          placeholder="dMax"
          value={dMax}
          onChange={(event) => setDMax(event.target.value)}
        />
        <input
          type="number"
          aria-label="dResolution"
          placeholder="dResolution"
          value={dResolution}
          onChange={(event) => setDResolution(event.target.value)}
        />
        <button type="button" disabled={!isStartable} onClick={() => onStart(range)}>
          실험 시작
        </button>
      </div>
      {isRunning && <progress value={progress} max={1} />}
    </section>
  )
}
