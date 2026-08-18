import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { parseRangePageParams } from './parseRangePageParams'
import type { RecentRange } from './types'
import { toInclusiveMinuteEnd } from './utils'

interface RangePageNavigation {
  range: RecentRange
  rangeKey: string
  currentPage: number
  goToPage: (page: number) => void
  search: (range: RecentRange) => void
}

export function useRangePageParams(): RangePageNavigation {
  const { from, to, page } = parseRangePageParams(useSearch({ strict: false }))
  const navigate = useNavigate()
  const [defaultUntil] = useState(() => toInclusiveMinuteEnd(new Date()))

  const since = from === undefined ? undefined : new Date(from)
  const until = to === undefined ? defaultUntil : new Date(to)

  function goToPage(nextPage: number): void {
    navigate({
      to: '.',
      search: (previous) => ({ ...previous, page: nextPage > 1 ? nextPage : undefined }),
    })
  }

  function search(nextRange: RecentRange): void {
    navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        from: nextRange.since?.getTime(),
        to: nextRange.until.getTime(),
        page: undefined,
      }),
    })
  }

  return {
    range: { since, until },
    rangeKey: `${since?.getTime() ?? 0}-${until.getTime()}`,
    currentPage: page ?? 1,
    goToPage,
    search,
  }
}
