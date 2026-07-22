import { DATE_TAG } from './consts'

export function encodeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return { [DATE_TAG]: value.toISOString() }
  }
  if (Array.isArray(value)) {
    return value.map(encodeValue)
  }
  if (checkIsPlainObject(value)) {
    return mapEntries(value, encodeValue)
  }
  return value
}

export function decodeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(decodeValue)
  }
  if (!checkIsPlainObject(value)) {
    return value
  }
  if (checkIsEncodedDate(value)) {
    return new Date(value[DATE_TAG])
  }
  return mapEntries(value, decodeValue)
}

function checkIsPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function mapEntries(
  value: Record<string, unknown>,
  transform: (item: unknown) => unknown,
): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, transform(item)]))
}

function checkIsEncodedDate(value: Record<string, unknown>): value is Record<string, string> {
  return Object.keys(value).length === 1 && typeof value[DATE_TAG] === 'string'
}
