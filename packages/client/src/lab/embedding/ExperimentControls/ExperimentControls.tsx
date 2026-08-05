import type { ReactElement } from 'react'
import { useState } from 'react'
import { checkIsValidDimRange } from '../computeDims'
import type { DimRange } from '../computeDims'
import { DEFAULT_BIAS } from '../consts'

interface ExperimentControlsProps {
  isLoaded: boolean
  isRunning: boolean
  progress: number
  onStart: (range: DimRange, bias: number) => void
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
  const [bias, setBias] = useState(String(DEFAULT_BIAS))
  const range: DimRange = {
    dMin: Number(dMin),
    dMax: Number(dMax),
    dResolution: Number(dResolution),
  }
  const biasValue = Number(bias)
  const isStartable =
    isLoaded &&
    !isRunning &&
    checkIsValidDimRange(range) &&
    !!bias.trim() &&
    Number.isFinite(biasValue)

  return (
    <section>
      <div className="grid">
        <label>
          최소 차원
          <input
            type="number"
            min={1}
            value={dMin}
            onChange={(event) => setDMin(event.target.value)}
          />
        </label>
        <label>
          최대 차원
          <input
            type="number"
            min={1}
            value={dMax}
            onChange={(event) => setDMax(event.target.value)}
          />
        </label>
        <label>
          탐색 개수
          <input
            type="number"
            min={1}
            value={dResolution}
            onChange={(event) => setDResolution(event.target.value)}
          />
        </label>
        <label>
          바이어스
          <input
            type="number"
            step="any"
            value={bias}
            onChange={(event) => setBias(event.target.value)}
          />
        </label>
      </div>
      <button type="button" disabled={!isStartable} onClick={() => onStart(range, biasValue)}>
        실험 시작
      </button>
      {isRunning && <progress value={progress} max={1} />}
    </section>
  )
}
