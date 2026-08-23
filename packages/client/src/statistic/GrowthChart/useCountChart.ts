import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ChartDataset, ChartOptions } from 'chart.js'
import type { ChartMode, CountLog, TimeUnit } from '../../db/countLog/types'
import { DELETION_COLOR, DELETION_LABEL, INCREASE_LABEL, TOTAL_LABEL } from '../consts'
import type { CountSeries } from '../types'
import { formatBinLabel } from '../utils'

Chart.register(
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
)

const CountChartOptions: ChartOptions<'line'> = {
  responsive: true,
  aspectRatio: 2 / 1.3,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

export function useCountChart(
  logs: CountLog[] | undefined,
  unit: TimeUnit,
  mode: ChartMode,
  series: CountSeries,
): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'line'> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const chart = new Chart(canvas, {
      type: 'line',
      data: { labels: [], datasets: createDatasets([], mode, series) },
      options: CountChartOptions,
    })
    chartRef.current = chart
    return (): void => {
      chart.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !logs) {
      return
    }
    chart.data.labels = logs.map((log) => formatBinLabel(unit, log.beginDate))
    chart.data.datasets = createDatasets(logs, mode, series)
    chart.update()
  }, [logs, unit, mode, series])

  return canvasRef
}

function createDatasets(
  logs: CountLog[],
  mode: ChartMode,
  series: CountSeries,
): ChartDataset<'line', number[]>[] {
  const values = logs.map((log) => log[series.key])
  if (mode === 'acc') {
    return [createDataset(TOTAL_LABEL, series.color, values)]
  }
  if (!series.hasDeletion) {
    return [createDataset(INCREASE_LABEL, series.color, values)]
  }
  return [
    createDataset(
      INCREASE_LABEL,
      series.color,
      values.map((value) => Math.max(value, 0)),
    ),
    createDataset(
      DELETION_LABEL,
      DELETION_COLOR,
      values.map((value) => Math.max(-value, 0)),
    ),
  ]
}

function createDataset(
  label: string,
  color: string,
  data: number[],
): ChartDataset<'line', number[]> {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color,
    tension: 0,
    pointRadius: 0,
    pointHitRadius: 8,
  }
}
