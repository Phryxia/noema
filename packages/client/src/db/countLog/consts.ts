import {
  DAY_ACC_STORE,
  DAY_DELTA_STORE,
  HOUR_ACC_STORE,
  HOUR_DELTA_STORE,
  WEEK_ACC_STORE,
  WEEK_DELTA_STORE,
} from '../consts'
import type { ChartMode, CountKind, TimeUnit } from './types'

export const CountKinds: CountKind[] = [
  'wordCount',
  'sentenceCount',
  'documentCount',
  'relationCount',
]

export const TimeUnits: TimeUnit[] = ['hour', 'day', 'week']

export const ChartModes: ChartMode[] = ['delta', 'acc']

export const CountStores: Record<TimeUnit, Record<ChartMode, string>> = {
  hour: { delta: HOUR_DELTA_STORE, acc: HOUR_ACC_STORE },
  day: { delta: DAY_DELTA_STORE, acc: DAY_ACC_STORE },
  week: { delta: WEEK_DELTA_STORE, acc: WEEK_ACC_STORE },
}

export const CountStoreNames: string[] = TimeUnits.flatMap((unit) => [
  CountStores[unit].delta,
  CountStores[unit].acc,
])
