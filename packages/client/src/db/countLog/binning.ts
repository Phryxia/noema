import type { CountLog, TimeUnit, Totals } from './types'

const DAYS_IN_WEEK = 7

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
  return { beginDate, wordCount: 0, sentenceCount: 0, documentCount: 0, relationCount: 0 }
}

export function createLog(beginDate: Date, totals: Totals): CountLog {
  return {
    beginDate,
    wordCount: totals.wordCount,
    sentenceCount: totals.sentenceCount,
    documentCount: totals.documentCount,
    relationCount: totals.relationCount,
  }
}
