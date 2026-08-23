import { CountKinds } from '../db/countLog/consts'
import type { CountKind, ChartMode, TimeUnit } from '../db/countLog/types'
import type { CountSeries } from './types'

export const TOTALS_QUERY_KEY = 'totals'
export const COUNT_LOGS_QUERY_KEY = 'countLogs'

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

const CountSeriesByKind: Record<CountKind, CountSeries> = {
  wordCount: { key: 'wordCount', label: '단어', color: '#4f8ff7', hasDeletion: true },
  sentenceCount: { key: 'sentenceCount', label: '문장', color: '#3fae7a', hasDeletion: true },
  documentCount: { key: 'documentCount', label: '문서', color: '#d98b2b', hasDeletion: true },
  relationCount: { key: 'relationCount', label: '관계', color: '#8f6fd8', hasDeletion: false },
}

export const CountSeriesList: CountSeries[] = CountKinds.map((kind) => CountSeriesByKind[kind])

export const DELETION_COLOR = '#d9534f'

export const INCREASE_LABEL = '증가'
export const DELETION_LABEL = '삭제'
export const TOTAL_LABEL = '보유'
