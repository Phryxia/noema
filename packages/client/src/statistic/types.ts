export type CountKind = 'wordCount' | 'sentenceCount' | 'documentCount'

export type TimeUnit = 'hour' | 'day' | 'week'

export type ChartMode = 'delta' | 'acc'

export type Totals = Record<CountKind, number>

export interface CountLog extends Totals {
  beginDate: Date
}

export interface CountSeries {
  key: CountKind
  label: string
  color: string
}
