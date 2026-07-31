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
import type { TrajectoryPoint } from '../types'

Chart.register(
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
)

const TRAIN_COLOR = '#2563eb'
const VALIDATION_COLOR = '#dc2626'

const AccuracyChartOptions: ChartOptions<'line'> = {
  responsive: true,
  aspectRatio: 2,
  interaction: { mode: 'index', intersect: false },
  spanGaps: true,
  scales: {
    y: { min: 0, max: 1 },
  },
}

export function useAccuracyChart(
  trajectory: TrajectoryPoint[],
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
      data: { labels: [], datasets: [] },
      options: AccuracyChartOptions,
    })
    chartRef.current = chart
    return (): void => {
      chart.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) {
      return
    }
    chart.data.labels = trajectory.map((_, index) => index + 1)
    chart.data.datasets = createDatasets(trajectory)
    chart.update()
  }, [trajectory])

  return canvasRef
}

function createDatasets(
  trajectory: TrajectoryPoint[],
): ChartDataset<'line', (number | null)[]>[] {
  return [
    createDataset(
      'Training Accuracy',
      TRAIN_COLOR,
      trajectory.map(({ train }) => train),
    ),
    createDataset(
      'Validation Accuracy',
      VALIDATION_COLOR,
      trajectory.map(({ validation }) => validation),
    ),
  ]
}

function createDataset(
  label: string,
  color: string,
  data: (number | null)[],
): ChartDataset<'line', (number | null)[]> {
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
