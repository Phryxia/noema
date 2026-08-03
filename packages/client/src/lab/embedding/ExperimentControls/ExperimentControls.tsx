import type { ReactElement } from 'react'
import { useState } from 'react'
import { checkIsValidDimRange } from '../computeDims'
import type { DimRange } from '../computeDims'
import { DEFAULT_SOFTMAX_TEMPERATURE } from '../consts'

interface ExperimentControlsProps {
  isLoaded: boolean
  isRunning: boolean
  progress: number
  onStart: (range: DimRange) => void
  onChangeTemperature: (temperature: number) => void
}

export function ExperimentControls({
  isLoaded,
  isRunning,
  progress,
  onStart,
  onChangeTemperature,
}: ExperimentControlsProps): ReactElement {
  const [dMin, setDMin] = useState('2')
  const [dMax, setDMax] = useState('32')
  const [dResolution, setDResolution] = useState('4')
  const [temperature, setTemperature] = useState(String(DEFAULT_SOFTMAX_TEMPERATURE))
  const range: DimRange = {
    dMin: Number(dMin),
    dMax: Number(dMax),
    dResolution: Number(dResolution),
  }
  const isStartable = isLoaded && !isRunning && checkIsValidDimRange(range)

  function updateTemperature(value: string): void {
    setTemperature(value)
    const parsed = Number(value)
    if (!value || !Number.isFinite(parsed) || parsed < 0) {
      return
    }
    onChangeTemperature(parsed)
  }

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
          출제 온도 τ
          <input
            type="number"
            min={0}
            step={0.1}
            value={temperature}
            onChange={(event) => updateTemperature(event.target.value)}
          />
        </label>
      </div>
      <button type="button" disabled={!isStartable} onClick={() => onStart(range)}>
        실험 시작
      </button>
      {isRunning && <progress value={progress} max={1} />}
    </section>
  )
}
