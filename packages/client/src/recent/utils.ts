import { sliceSafely } from '../utils/sliceSafely'

const MinuteFormat = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatDateTimeLocal(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
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
  return MinuteFormat.format(date)
}

export function createPreview(value: string, length: number): string {
  const sliced = sliceSafely(value, length)
  if (sliced.length < value.length) {
    return `${sliced}…`
  }
  return sliced
}
