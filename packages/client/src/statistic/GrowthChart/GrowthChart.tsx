import type { ReactElement } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChartModes, TimeUnits } from '../../db/countLog/consts'
import type { ChartMode, TimeUnit } from '../../db/countLog/types'
import {
  COUNT_LOGS_QUERY_KEY,
  ChartModeLabels,
  CountSeriesList,
  TimeUnitLabels,
} from '../consts'
import { getCountLogs } from '../statistic.service'
import { CountChart } from './CountChart'
import classnames from 'classnames/bind'
import styles from './GrowthChart.module.css'

const cx = classnames.bind(styles)

export function GrowthChart(): ReactElement {
  const [unit, setUnit] = useState<TimeUnit>('hour')
  const [mode, setMode] = useState<ChartMode>('delta')
  const { data: logs } = useQuery({
    queryKey: [COUNT_LOGS_QUERY_KEY, unit, mode],
    queryFn: () => getCountLogs(unit, mode),
  })

  return (
    <section>
      <h2>증가 추이</h2>
      <fieldset role="group">
        <select value={unit} onChange={(event) => setUnit(event.target.value as TimeUnit)}>
          {TimeUnits.map((timeUnit) => (
            <option key={timeUnit} value={timeUnit}>
              {TimeUnitLabels[timeUnit]}
            </option>
          ))}
        </select>
        <select value={mode} onChange={(event) => setMode(event.target.value as ChartMode)}>
          {ChartModes.map((chartMode) => (
            <option key={chartMode} value={chartMode}>
              {ChartModeLabels[chartMode]}
            </option>
          ))}
        </select>
      </fieldset>
      <div className={cx('charts')}>
        {CountSeriesList.map((series) => (
          <CountChart key={series.key} series={series} logs={logs} unit={unit} mode={mode} />
        ))}
      </div>
    </section>
  )
}
