import type { QueryClient } from '@tanstack/react-query'
import { BinCounts, COUNT_LOGS_QUERY_KEY, TOTALS_QUERY_KEY } from './consts'
import type { CountLog, TimeUnit, Totals } from './types'

const DAYS_IN_WEEK = 7

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

export function getBinDate(unit: TimeUnit, date: Date): Date {
  if (unit === 'hour') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())
  }
  if (unit === 'day') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
}

export function shiftBin(unit: TimeUnit, date: Date, amount: number): Date {
  const shifted = new Date(date)
  if (unit === 'hour') {
    shifted.setHours(shifted.getHours() + amount)
    return shifted
  }
  if (unit === 'day') {
    shifted.setDate(shifted.getDate() + amount)
    return shifted
  }
  shifted.setDate(shifted.getDate() + amount * DAYS_IN_WEEK)
  return shifted
}

export function createEmptyLog(beginDate: Date): CountLog {
  return { beginDate, wordCount: 0, sentenceCount: 0, documentCount: 0 }
}

export function createLog(beginDate: Date, totals: Totals): CountLog {
  return {
    beginDate,
    wordCount: totals.wordCount,
    sentenceCount: totals.sentenceCount,
    documentCount: totals.documentCount,
  }
}

export function formatBinLabel(unit: TimeUnit, date: Date): string {
  if (unit === 'hour') {
    return `${date.getHours()}시`
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}
