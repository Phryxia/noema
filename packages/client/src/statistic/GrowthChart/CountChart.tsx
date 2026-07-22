import type { ReactElement } from 'react'
import type { ChartMode, CountLog, CountSeries, TimeUnit } from '../types'
import { useCountChart } from './useCountChart'
import classnames from 'classnames/bind'
import styles from './CountChart.module.css'

const cx = classnames.bind(styles)

interface CountChartProps {
  series: CountSeries
  logs: CountLog[] | undefined
  unit: TimeUnit
  mode: ChartMode
}

export function CountChart({ series, logs, unit, mode }: CountChartProps): ReactElement {
  const canvasRef = useCountChart(logs, unit, mode, series)

  return (
    <section className={cx('root')}>
      <h3 className={cx('title')}>{series.label}</h3>
      <canvas ref={canvasRef} />
    </section>
  )
}
