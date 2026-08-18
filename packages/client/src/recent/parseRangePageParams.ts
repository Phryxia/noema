export interface RangePageParams {
  from?: number
  to?: number
  page?: number
}

export interface RangePageParamsInput {
  from?: unknown
  to?: unknown
  page?: unknown
}

export function parseRangePageParams(search: RangePageParamsInput): RangePageParams {
  const params: RangePageParams = {}
  const from = toTimestamp(search.from)
  if (from !== undefined) {
    params.from = from
  }
  const to = toTimestamp(search.to)
  if (to !== undefined) {
    params.to = to
  }
  const page = toPageNumber(search.page)
  if (page !== undefined) {
    params.page = page
  }
  return params
}

function toTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  const timestamp = Number(value)
  return Number.isFinite(timestamp) ? timestamp : undefined
}

function toPageNumber(value: unknown): number | undefined {
  const page = toTimestamp(value)
  if (page === undefined || !Number.isInteger(page) || page < 1) {
    return undefined
  }
  return page
}
