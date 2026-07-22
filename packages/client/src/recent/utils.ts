import { sliceSafely } from '../utils/sliceSafely'

export function formatDateTimeLocal(date: Date): string {
  const { year, month, day, hour, minute } = splitDateTime(date)
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export function parseDateTimeLocal(value: string): Date | undefined {
  if (!value) {
    return undefined
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }
  return parsed
}

export function toInclusiveMinuteEnd(date: Date): Date {
  const end = new Date(date)
  end.setSeconds(59, 999)
  return end
}

export function formatMinute(date: Date): string {
  const { year, month, day, hour, minute } = splitDateTime(date)
  return `${year.slice(2)}-${month}-${day} ${hour}:${minute}`
}

interface DateTimeParts {
  year: string
  month: string
  day: string
  hour: string
  minute: string
}

function splitDateTime(date: Date): DateTimeParts {
  return {
    year: String(date.getFullYear()).padStart(4, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    hour: String(date.getHours()).padStart(2, '0'),
    minute: String(date.getMinutes()).padStart(2, '0'),
  }
}

export function createPreview(value: string, length: number): string {
  const sliced = sliceSafely(value, length)
  if (sliced.length < value.length) {
    return `${sliced}…`
  }
  return sliced
}
