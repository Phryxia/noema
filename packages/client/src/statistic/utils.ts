import type { QueryClient } from '@tanstack/react-query'
import { getBinDate, shiftBin } from '../db/countLog/binning'
import type { TimeUnit } from '../db/countLog/types'
import { BinCounts, COUNT_LOGS_QUERY_KEY, TOTALS_QUERY_KEY } from './consts'

export function invalidateStatisticQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: [TOTALS_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: [COUNT_LOGS_QUERY_KEY] })
}

export function createBins(unit: TimeUnit, now: Date): Date[] {
  const latest = getBinDate(unit, now)
  const bins: Date[] = []
  for (let offset = BinCounts[unit] - 1; offset >= 0; offset -= 1) {
    bins.push(shiftBin(unit, latest, -offset))
  }
  return bins
}

export function formatBinLabel(unit: TimeUnit, date: Date): string {
  if (unit === 'hour') {
    return `${date.getHours()}시`
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}
