import type { ReactElement } from 'react'
import { useAccuracyChart } from './useAccuracyChart'
import type { TrajectoryPoint } from '../types'

interface ModelReportProps {
  trajectory: TrajectoryPoint[]
}

export function ModelReport({ trajectory }: ModelReportProps): ReactElement {
  const canvasRef = useAccuracyChart(trajectory)

  return (
    <section>
      {!trajectory.length && (
        <p>아직 기록된 궤적이 없습니다. 문제를 풀면 예측 성공률이 기록됩니다.</p>
      )}
      <canvas ref={canvasRef} />
    </section>
  )
}
