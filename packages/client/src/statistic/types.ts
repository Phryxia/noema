import type { CountKind } from '../db/countLog/types'

export interface CountSeries {
  key: CountKind
  label: string
  color: string
  hasDeletion: boolean
}
