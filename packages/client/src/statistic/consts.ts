import {
  DAY_ACC_STORE,
  DAY_DELTA_STORE,
  HOUR_ACC_STORE,
  HOUR_DELTA_STORE,
  WEEK_ACC_STORE,
  WEEK_DELTA_STORE,
} from '../db/consts'
import type { ChartMode, CountKind, CountSeries, TimeUnit } from './types'

export const TOTALS_QUERY_KEY = 'totals'
export const COUNT_LOGS_QUERY_KEY = 'countLogs'

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

export const BinCounts: Record<TimeUnit, number> = {
  hour: 24,
  day: 28,
  week: 52,
}

export const TimeUnitLabels: Record<TimeUnit, string> = {
  hour: '1시간 단위',
  day: '1일 단위',
  week: '1주 단위',
}

export const ChartModeLabels: Record<ChartMode, string> = {
  delta: '변화량',
  acc: '누적',
}

export const CountSeriesList: CountSeries[] = [
  { key: 'wordCount', label: '단어', color: '#4f8ff7' },
  { key: 'sentenceCount', label: '문장', color: '#3fae7a' },
  { key: 'documentCount', label: '문서', color: '#d98b2b' },
]

export const CountKinds: CountKind[] = CountSeriesList.map((series) => series.key)

export const DELETION_COLOR = '#d9534f'

export const INCREASE_LABEL = '증가'
export const DELETION_LABEL = '삭제'
export const TOTAL_LABEL = '보유'
